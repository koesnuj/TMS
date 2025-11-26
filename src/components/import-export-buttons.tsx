'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import { importTestCases } from "@/app/actions";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ImportExportButtonsProps {
  projectId: string;
  suiteId: string;
  testCases: any[];
  canEdit: boolean; // New prop for permission check
}

export function ImportExportButtons({ projectId, suiteId, testCases, canEdit }: ImportExportButtonsProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export Logic (Anyone can export/view)
  const handleExport = () => {
    if (testCases.length === 0) {
      toast.error("No test cases to export");
      return;
    }

    try {
      const data = testCases.map(tc => ({
        Title: tc.title,
        Priority: tc.priority,
        Description: tc.description,
        Steps: tc.steps
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Test Cases");
      
      XLSX.writeFile(workbook, `test-cases-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export");
    }
  };

  // Import Logic (Restricted)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          toast.error("Empty file");
          return;
        }

        const mappedCases = data.map(row => ({
          title: row.Title || row.title || "Untitled",
          description: row.Description || row.description || "",
          priority: row.Priority || row.priority || "Medium",
          steps: row.Steps || row.steps || "[]"
        }));

        await importTestCases(projectId, suiteId, mappedCases);
        toast.success(`Imported ${mappedCases.length} cases!`);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Failed to import. Check file format.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" /> Export
      </Button>
      
      {canEdit && (
        <>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.csv" 
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Import
          </Button>
        </>
      )}
    </div>
  );
}
