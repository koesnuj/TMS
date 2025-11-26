import { getTestRuns, createTestRun } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function TestRunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const runs = await getTestRuns(projectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Test Runs</h2>
          <p className="text-muted-foreground">
            Execute and track your test cycles.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlayCircle className="mr-2 h-4 w-4" /> Start New Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={createTestRun}>
              <input type="hidden" name="projectId" value={projectId} />
              <DialogHeader>
                <DialogTitle>Start New Test Run</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Run Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Regression v1.2.0" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Start Run</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {runs.map((run) => {
          const total = run._count.results;
          const passed = run.results.filter(r => r.status === 'Passed').length;
          const failed = run.results.filter(r => r.status === 'Failed').length;
          const progress = total > 0 ? Math.round(((passed + failed) / total) * 100) : 0;
          const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

          return (
            <Link key={run.id} href={`runs/${run.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{run.title}</CardTitle>
                    <CardDescription>Started on {run.createdAt.toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> {passed}
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" /> {failed}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" /> {total - passed - failed}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}% ({passRate}% Passed)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all" 
                        style={{ width: `${passRate}%` }}
                      />
                      {/* Failed bar could go here too if needed */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        
        {runs.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No test runs yet. Start one to begin testing.
          </div>
        )}
      </div>
    </div>
  );
}

