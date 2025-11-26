import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlayCircle, CheckCircle2, XCircle } from "lucide-react";

export default async function ProjectDashboard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  
  const stats = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      _count: {
        select: {
          suites: true,
          testRuns: true,
        }
      },
      suites: {
        select: {
          _count: {
            select: { testCases: true }
          }
        }
      }
    }
  });

  // Calculate total test cases
  const totalTestCases = stats?.suites.reduce((acc, suite) => acc + suite._count.testCases, 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestCases}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Runs</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?._count.testRuns || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?._count.suites || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

