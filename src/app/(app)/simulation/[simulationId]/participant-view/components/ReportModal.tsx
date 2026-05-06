import React from "react";
import { X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReportModalProps {
  report: { filePath: string; fileName: string };
  loading: boolean;
  onClose: () => void;
}

export function ReportModal({ report, loading, onClose }: ReportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-md animate-fade-in p-4">
      <Card className="w-full max-w-5xl h-[calc(100vh-2rem)] bg-[var(--bg-surface)] shadow-2xl rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-8 py-6 border-b border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-serif font-black text-white truncate drop-shadow-md">{report.fileName}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-1">Document Opérationnel PDF</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold rounded-xl px-4" onClick={() => {
                const link = document.createElement("a");
                link.href = report.filePath;
                link.download = report.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                <Download className="h-4 w-4 mr-2" />Télécharger
              </Button>
              <Button size="icon" variant="ghost" className="text-white/80 hover:bg-white/20 hover:text-white rounded-xl" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-0 overflow-hidden flex-1 bg-[var(--bg-primary)] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)]/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-cyan-500 mx-auto mb-4"></div>
                <p className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-widest">Initialisation du flux...</p>
              </div>
            </div>
          )}
          <iframe src={report.filePath} className="w-full h-full border-none shadow-inner" title="Visualiseur PDF" />
        </div>
      </Card>
    </div>
  );
}
