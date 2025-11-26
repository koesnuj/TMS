'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProjects() {
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
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string
  const suiteId = formData.get('suiteId') as string
  const projectId = formData.get('projectId') as string
  
  // Steps handling could be more complex, basic string for now
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

  revalidatePath(`/projects/${projectId}/cases`)
}

// Bulk Import Action
export async function importTestCases(projectId: string, suiteId: string, cases: any[]) {
  if (!projectId || !suiteId || !cases.length) {
    throw new Error("Invalid data for import");
  }

  try {
    // Prepare data for bulk insert
    // Note: createMany is not supported for SQLite in some versions/configs, 
    // but here we use transaction to be safe and compatible
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
  const title = formData.get('title') as string
  const projectId = formData.get('projectId') as string

  if (!title || !projectId) throw new Error('Missing required fields')

  // 1. Get all test cases in the project (Simple version: include all)
  // In a real app, you would select specific suites or cases
  const testCases = await prisma.testCase.findMany({
    where: { suite: { projectId } },
    select: { id: true }
  })

  if (testCases.length === 0) {
    throw new Error('No test cases found to run')
  }

  // 2. Create Test Run and initial Results
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
  await prisma.testResult.update({
    where: { id: resultId },
    data: {
      status,
      comment
    }
  })
}
