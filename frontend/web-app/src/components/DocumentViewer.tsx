"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "./ui/Card";
import { Button } from "./ui/Button";
import { UploadCloud, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { TbmlService } from "../lib/api";

export default function DocumentViewer() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  // Simulate API call for TBML check
  const tbmlCheckMutation = useMutation({
    mutationFn: (fileContent: string) => TbmlService.checkTransaction({ 
      transaction_id: `txn-${Date.now()}`,
      document_url: "gs://mock-bucket/mock-doc.pdf", // Mock URL
      commodity_code: "HS8501", // Mock data
      quantity: 100.0,
      total_amount: 100000.0,
      currency: "USD",
      origin_country: "ZA",
      destination_country: "NG",
    }),
    onSuccess: (data) => {
      console.log("TBML Check Success:", data);
      setUploadedDocs((prev) => [
        {
          id: data.transaction_id,
          name: selectedFile?.name || "Uploaded Document",
          status: data.recommendation === "FLAG FOR REVIEW" ? "MISMATCH" : "MATCH",
          date: new Date().toLocaleDateString(),
          type: "INV",
          // Assuming data includes explanation of flags
          discrepancy: data.flags.length > 0 ? data.flags.join(", ") : null,
        },
        ...prev,
      ]);
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error("TBML Check Error:", error);
      // Handle error display
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      processFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    // For demo, just read as text or a placeholder. In real app, upload to GCS first.
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        tbmlCheckMutation.mutate(e.target.result as string); // Simulate content
      }
    };
    reader.readAsText(file); // or readAsDataURL if it's an image/PDF
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Document Intelligence"
        subtitle="Automated verification & cross-referencing"
        action={<Button size="sm" variant="outline" leftIcon={<UploadCloud className="w-3 h-3"/>}>Upload</Button>}
      />

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer mb-6 relative ${
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-outline/20 hover:border-primary/50 hover:bg-surface-variant/10"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,.xlsx,.csv"
        />
        {tbmlCheckMutation.isPending ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-sm font-medium text-on-surface">Analyzing {selectedFile?.name || 'document'}...</p>
            <p className="text-xs text-on-surface-variant">Please wait</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-on-surface mb-1">Click or drag to upload</p>
            <p className="text-xs text-on-surface-variant">Invoices, B/L, Financial Statements</p>
          </>
        )}
      </div>
      {tbmlCheckMutation.isError && (
        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Error analyzing document: {tbmlCheckMutation.error?.message}</span>
        </motion.div>
      )}


      {/* File List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Analyzed Documents</p>
        
        {uploadedDocs.length === 0 && (
            <div className="text-sm text-on-surface-variant text-center py-4">No documents analyzed yet.</div>
        )}

        {uploadedDocs.map((doc, index) => (
          <FileItem key={doc.id} name={doc.name} size="~" date={doc.date} status={doc.status} discrepancy={doc.discrepancy} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Button className="w-full" variant="secondary" leftIcon={<UploadCloud className="w-4 h-4"/>}>
          View All Uploads
        </Button>
      </div>
    </Card>
  );
}

function FileItem({ name, size, date, status, discrepancy }: { name: string, size: string, date: string, status: string, discrepancy?: string }) {
  return (
    <div className="flex items-center p-3 rounded-xl bg-surface-variant/10 border border-white/5 hover:bg-surface-variant/20 transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0 text-secondary">
        <FileText className="w-5 h-5" />
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{name}</p>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>{date}</span>
          {status && <><span>•</span><StatusBadge status={status} /></>}
        </div>
        {discrepancy && (
            <div className="mt-1 text-xs text-error/80 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Discrepancy: {discrepancy}</span>
            </div>
        )}
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-surface-variant/50 rounded-lg transition-all text-on-surface-variant hover:text-error">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    MATCH: "bg-green-500/10 text-green-400 border-green-500/20",
    MISMATCH: "bg-red-500/10 text-red-400 border-red-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ERROR: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}