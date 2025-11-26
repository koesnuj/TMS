'use server'

import { prisma } from "@/lib/prisma"
import { encrypt, logout, checkPermission } from "@/lib/auth"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// --- Auth Actions ---

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    throw new Error("All fields are required");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // First user is ADMIN, others are GUEST by default (safer default)
  const userCount = await prisma.user.count();
  const role = userCount === 0 ? "ADMIN" : "GUEST";
  const status = userCount === 0 ? "ACTIVE" : "PENDING";

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      status,
    },
  });
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Your account is pending approval.");
  }

  // Create session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    } 
  });

  cookies().set("session", session, { expires, httpOnly: true });

  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

// --- Admin Actions ---

export async function getUsers() {
  await checkPermission(["ADMIN"]);
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserStatus(userId: string, status: string) {
  await checkPermission(["ADMIN"]);
  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: string) {
  await checkPermission(["ADMIN"]);
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(userId: string) {
  await checkPermission(["ADMIN"]);
  const defaultPassword = await bcrypt.hash("12345678", 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: defaultPassword },
  });
  revalidatePath("/admin/users");
}

// --- Project Actions (Require ADMIN or QA) ---

export async function getProjects() {
  // Everyone can read
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { suites: true, testRuns: true }
      }
    }
  })
}

export async function createProject(formData: FormData) {
  await checkPermission(["ADMIN", "QA"]);
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    throw new Error('Project name is required')
  }

  await prisma.project.create({
    data: {
      name,
      description
    }
  })

  revalidatePath('/')
}

export async function getSuites(projectId: string) {
  return await prisma.testSuite.findMany({
    where: { projectId },
    include: {
      testCases: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createSuite(formData: FormData) {
  await checkPermission(["ADMIN", "QA"]);
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId = formData.get('projectId') as string

  if (!title || !projectId) throw new Error('Missing required fields')

  await prisma.testSuite.create({
    data: {
      title,
      description,
      projectId
    }
  })

  revalidatePath(`/projects/${projectId}/cases`)
}

export async function createTestCase(formData: FormData) {
  await checkPermission(["ADMIN", "QA"]);
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const suiteId = formData.get('suiteId') as string
  
  // Steps handling
  const steps = formData.get('steps') as string || '[]'

  if (!title || !suiteId) throw new Error('Missing required fields')

  await prisma.testCase.create({
    data: {
      title,
      description,
      priority,
      steps,
      suiteId
    }
  })

  revalidatePath(`/projects/${projectId}/cases`) // Revalidate parent path properly in real app
}

// Bulk Import Action
export async function importTestCases(projectId: string, suiteId: string, cases: any[]) {
  await checkPermission(["ADMIN", "QA"]);
  if (!projectId || !suiteId || !cases.length) {
    throw new Error("Invalid data for import");
  }

  try {
    await prisma.$transaction(
      cases.map(c => prisma.testCase.create({
        data: {
          title: c.title || "Untitled Case",
          description: c.description || "",
          priority: ["Low", "Medium", "High"].includes(c.priority) ? c.priority : "Medium",
          steps: c.steps ? (typeof c.steps === 'string' ? c.steps : JSON.stringify(c.steps)) : '[]',
          suiteId
        }
      }))
    );

    revalidatePath(`/projects/${projectId}/cases`);
    return { success: true, count: cases.length };
  } catch (error) {
    console.error("Import Error:", error);
    throw new Error("Failed to import cases");
  }
}

export async function getTestRuns(projectId: string) {
  return await prisma.testRun.findMany({
    where: { projectId },
    include: {
      _count: {
        select: { results: true }
      },
      results: {
        select: { status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getTestRun(runId: string) {
  return await prisma.testRun.findUnique({
    where: { id: runId },
    include: {
      project: true,
      results: {
        include: {
          testCase: true
        },
        orderBy: { testCase: { title: 'asc' } }
      }
    }
  })
}

export async function createTestRun(formData: FormData) {
  await checkPermission(["ADMIN", "QA"]);
  const title = formData.get('title') as string
  const projectId = formData.get('projectId') as string

  if (!title || !projectId) throw new Error('Missing required fields')

  const testCases = await prisma.testCase.findMany({
    where: { suite: { projectId } },
    select: { id: true }
  })

  if (testCases.length === 0) {
    throw new Error('No test cases found to run')
  }

  await prisma.testRun.create({
    data: {
      title,
      projectId,
      results: {
        create: testCases.map(tc => ({
          testCaseId: tc.id,
          status: 'Pending'
        }))
      }
    }
  })

  revalidatePath(`/projects/${projectId}/runs`)
}

export async function updateTestResult(resultId: string, status: string, comment?: string) {
  // QA and Admin can execute tests. Guest cannot.
  await checkPermission(["ADMIN", "QA"]);
  await prisma.testResult.update({
    where: { id: resultId },
    data: {
      status,
      comment
    }
  })
}
