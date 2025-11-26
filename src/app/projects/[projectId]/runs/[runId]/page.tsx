import { getTestRun } from "@/app/actions";
import { TestRunner } from "@/components/test-runner";
import { notFound } from "next/navigation";

export default async function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const testRun = await getTestRun(runId);

  if (!testRun) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{testRun.title}</h1>
          <p className="text-sm text-muted-foreground">Running on {testRun.project.name}</p>
        </div>
      </div>
      <TestRunner testRun={testRun} />
    </div>
  );
}

