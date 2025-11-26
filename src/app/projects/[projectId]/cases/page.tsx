import { getSuites, createSuite, createTestCase } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Folder, Plus, FileText, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImportExportButtons } from "@/components/import-export-buttons";

export default async function CasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ suiteId?: string }>;
}) {
  const { projectId } = await params;
  const { suiteId } = await searchParams;
  const suites = await getSuites(projectId);
  
  const activeSuite = suites.find(s => s.id === suiteId) || suites[0];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Sidebar: Suites */}
      <div className="w-1/3 min-w-[250px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Suites</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form action={createSuite}>
                <input type="hidden" name="projectId" value={projectId} />
                <DialogHeader>
                  <DialogTitle>Create Test Suite</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-2 space-y-1 overflow-y-auto h-full">
            {suites.map((suite) => (
              <a
                key={suite.id}
                href={`?suiteId=${suite.id}`}
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors ${
                  activeSuite?.id === suite.id ? "bg-muted font-medium" : ""
                }`}
              >
                <Folder className="h-4 w-4 text-blue-500" />
                <span className="truncate">{suite.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {suite.testCases.length}
                </span>
              </a>
            ))}
            {suites.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No suites yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Content: Test Cases */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {activeSuite ? activeSuite.title : "Select a Suite"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeSuite?.description}
            </p>
          </div>
          
          {activeSuite && (
            <div className="flex gap-2">
              <ImportExportButtons 
                projectId={projectId} 
                suiteId={activeSuite.id} 
                testCases={activeSuite.testCases} 
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> New Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form action={createTestCase}>
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="suiteId" value={activeSuite.id} />
                    <DialogHeader>
                      <DialogTitle>Create Test Case</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select name="priority" defaultValue="Medium">
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="description">Pre-conditions / Description</Label>
                        <Textarea id="description" name="description" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="steps">Steps & Expected Results (JSON for now)</Label>
                        <Textarea 
                          id="steps" 
                          name="steps" 
                          className="font-mono text-xs"
                          rows={5}
                          defaultValue={'[\n  {\n    "step": "Step 1",\n    "expected": "Result 1"\n  }\n]'} 
                        />
                        <p className="text-xs text-muted-foreground">
                          * Will be replaced with a rich editor later.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Case</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <Card className="flex-1 overflow-hidden bg-muted/20 border-dashed">
          <CardContent className="p-0 h-full overflow-y-auto">
            {activeSuite ? (
              <div className="divide-y">
                {activeSuite.testCases.map((testCase) => (
                  <div key={testCase.id} className="p-4 hover:bg-background transition-colors flex items-start gap-4 group">
                    <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{testCase.title}</span>
                        <Badge variant={testCase.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                          {testCase.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {testCase.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {activeSuite.testCases.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    No test cases in this suite. Import or create new ones to get started.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a suite to view test cases
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
