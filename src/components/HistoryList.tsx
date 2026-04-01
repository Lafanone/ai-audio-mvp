"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, FileText } from "lucide-react";

type Recording = {
  id: string;
  transcription: string | null;
  createdAt: string;
};

export default function HistoryList() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (recordings.length === 0) {
    return null; 
  }

  return (
    <Card className="w-full max-w-md mt-6 shadow-sm border-gray-200 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader className="pb-3 border-b border-gray-100 mb-3">
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Your History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {recordings.map((rec) => (
          <div key={rec.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors hover:bg-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">
                {new Date(rec.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {rec.transcription || "No transcription available."}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}