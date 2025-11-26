'use client'

import { useState } from "react";
import { updateTestResult } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Circle, AlertCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TestRunnerProps {
  testRun: any; // Type from Prisma include
}

export function TestRunner({ testRun }: TestRunnerProps) {
  const router = useRouter();
  const [activeResultId, setActiveResultId] = useState<string>(
    testRun.results[0]?.id || ""
  );
  const [comment, setComment] = useState("");

  const activeResult = testRun.results.find((r: any) => r.id === activeResultId);
  const activeCase = activeResult?.testCase;

  // Parse steps safely
  const steps = activeCase ? JSON.parse(activeCase.steps || '[]') : [];

  const handleStatusUpdate = async (status: string) => {
    if (!activeResultId) return;
    
    await updateTestResult(activeResultId, status, comment);
    setComment(""); // Reset comment
    router.refresh(); // Refresh data to show updated status
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'text-green-600';
      case 'Failed': return 'text-red-600';
      case 'Skipped': return 'text-yellow-600';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Failed': return <XCircle className="h-4 w-4" />;
      case 'Skipped': return <AlertCircle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left: Test Case List */}
      <div className="w-1/3 min-w-[300px] border rounded-lg flex flex-col bg-background">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold">Test Cases ({testRun.results.length})</h3>
          <div className="flex gap-4 text-xs mt-2">
            <span className="text-green-600 font-medium">
              {testRun.results.filter((r: any) => r.status === 'Passed').length} Passed
            </span>
            <span className="text-red-600 font-medium">
              {testRun.results.filter((r: any) => r.status === 'Failed').length} Failed
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {testRun.results.map((result: any) => (
              <button
                key={result.id}
                onClick={() => setActiveResultId(result.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center gap-3",
                  activeResultId === result.id && "bg-muted border-l-4 border-l-primary"
                )}
              >
                <div className={cn(getStatusColor(result.status))}>
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.testCase.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {result.status}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Test Execution Area */}
      <div className="flex-1 flex flex-col">
        {activeResult ? (
          <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-2">{activeCase.priority}</Badge>
                  <CardTitle className="text-2xl">{activeCase.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {activeCase.description || "No description provided."}
                  </CardDescription>
                </div>
                <div className={cn("px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2", getStatusColor(activeResult.status))}>
                  {getStatusIcon(activeResult.status)}
                  {activeResult.status}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 px-0 overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Test Steps
                  </h4>
                  {steps.length > 0 ? (
                    <div className="space-y-4 border rounded-lg p-4 bg-card">
                      {steps.map((step: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-[24px_1fr] gap-4">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div className="space-y-2">
                            <div className="font-medium">{step.step}</div>
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              Expected: {step.expected}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm italic">No structured steps defined.</div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Result Comment</h4>
                  <Textarea 
                    placeholder="Add a comment (e.g. Jira issue link, error message)..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    defaultValue={activeResult.comment || ""}
                  />
                </div>
              </div>
            </CardContent>

            <div className="pt-6 border-t mt-auto flex gap-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleStatusUpdate('Passed')}
              >
                Pass
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                variant="destructive"
                onClick={() => handleStatusUpdate('Failed')}
              >
                Fail
              </Button>
              <Button 
                className="flex-1"
                variant="secondary"
                onClick={() => handleStatusUpdate('Skipped')}
              >
                Skip
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a test case to start execution.
          </div>
        )}
      </div>
    </div>
  );
}

