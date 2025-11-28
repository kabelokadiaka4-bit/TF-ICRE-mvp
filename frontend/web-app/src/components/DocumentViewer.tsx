"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "./ui/Card";
import { Button } from "./ui/Button";
import { FileText, Check, AlertCircle, Eye, Download } from "lucide-react";

export default function DocumentViewer() {
  const documents = [
    { id: 1, name: "Commercial Invoice", status: "MATCH", date: "2024-11-20", type: "INV" },
    { id: 2, name: "Bill of Lading", status: "MISMATCH", date: "2024-11-21", type: "BL" },
    { id: 3, name: "Letter of Credit", status: "MATCH", date: "2024-11-15", type: "LC" },
    { id: 4, name: "Certificate of Origin", status: "PENDING", date: "2024-11-22", type: "COO" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Document Intelligence"
        subtitle="Automated verification & cross-referencing"
        action={<Button size="sm" variant="outline" leftIcon={<Download className="w-3 h-3"/>}>Download All</Button>}
      />

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-surface-variant/5 border border-white/5 hover:bg-surface-variant/10 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-variant/20 flex items-center justify-center text-on-surface-variant font-bold text-xs">
                  {doc.type}
                </div>
                <div>
                  <div className="text-sm font-medium text-on-surface">{doc.name}</div>
                  <div className="text-[10px] text-on-surface-variant">{doc.date}</div>
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </div>
            
            {doc.status === "MISMATCH" && (
              <div className="mt-2 p-2 rounded-lg bg-error/10 border border-error/20 text-xs text-error flex items-start gap-2">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Discrepancy: Shipment date on B/L exceeds L/C expiry by 2 days.</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Button className="w-full" variant="secondary" leftIcon={<Eye className="w-4 h-4"/>}>
          View Comparison Mode
        </Button>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    MATCH: "bg-green-500/10 text-green-400 border-green-500/20",
    MISMATCH: "bg-red-500/10 text-red-400 border-red-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}
