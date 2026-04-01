"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, FileText, Sparkles, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Recording = {
  id: string;
  transcription: string | null;
  analysis: string | null; 
  createdAt: string;
};

export default function HistoryList() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Для индикации удаления

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setRecordings(data.recordings || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this recording?")) return;

    setDeletingId(id);
    try {
      const res = await fetch("/api/history/delete", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setRecordings(prev => prev.filter(rec => rec.id !== id));
        toast.success("Record deleted");
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Error deleting record");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (recordings.length === 0) return null;

  return (
    <Card className="w-full max-w-xl mt-8 shadow-lg border-gray-200/60 bg-white/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
      <CardHeader className="pb-3 border-b border-gray-100 mb-3">
        <CardTitle className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Your Smart History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {recordings.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-blue-200">
            
            <div 
              className="p-4 cursor-pointer flex justify-between items-start"
              onClick={() => toggleExpand(rec.id)}
            >
              <div className="flex flex-col gap-2 w-full pr-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(rec.createdAt).toLocaleString()}
                </span>
                <div className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {rec.analysis ? rec.analysis.split('\n')[0] : rec.transcription}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  onClick={(e) => handleDelete(e, rec.id)}
                  disabled={deletingId === rec.id}
                >
                  {deletingId === rec.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 rounded-full">
                  {expandedId === rec.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {expandedId === rec.id && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/30 space-y-4 animate-in slide-in-from-top-2 duration-300">
                {rec.analysis && (
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-xl relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center mb-3">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                      AI Summary & Insights
                    </h4>
                    <div className="text-sm text-indigo-950/80 leading-relaxed whitespace-pre-wrap font-medium">
                      {rec.analysis}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center mb-3">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Raw Transcript
                  </h4>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {rec.transcription}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}