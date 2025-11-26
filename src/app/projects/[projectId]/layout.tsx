import { AppSidebar } from "@/components/app-sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <AppSidebar projectId={projectId} projectName={project.name} />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 bg-muted/10">
        {children}
      </div>
    </div>
  );
}

