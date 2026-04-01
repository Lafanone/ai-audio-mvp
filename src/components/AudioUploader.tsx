"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Copy, Check, Zap, Sparkles, FileText } from "lucide-react";

const FREE_LIMIT = 5;

export default function AudioUploader({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>(""); 
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usageCount, setUsageCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setUsageCount(data.usageCount);
        setIsPro(data.isPro);
      }
    } catch (error) {
      console.error("Failed to load user data", error);
    } finally {
      setFetchingUser(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an audio file first.");
      return;
    }

    setLoading(true);
    setTranscription("");
    setAnalysis("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      const textResponse = await res.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error("Server error: check console");
      }

      if (!res.ok) throw new Error(data.error || "Error processing audio");

      setTranscription(data.text);
      setAnalysis(data.analysis); 
      toast.success("Magic done! Text and analysis ready.");
      
      setUsageCount((prev) => prev + 1);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onUploadSuccess?.();

    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${transcription}\n\n--- AI Analysis ---\n${analysis}`);
    setCopiedText(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isLimitReached = !isPro && usageCount >= FREE_LIMIT;

  return (
    <Card className="w-full max-w-xl shadow-lg border-gray-200/60 bg-white/50 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
          Audio AI Studio
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1 font-medium">Transcribe & Analyze in seconds</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {!fetchingUser && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/60 flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isPro ? "Pro Subscription" : "Free Plan"}
              </span>
              <span className="text-sm font-bold text-gray-800 mt-1">
                {isPro ? "Unlimited uses" : `${usageCount} of ${FREE_LIMIT} uses remaining`}
              </span>
            </div>
            {!isPro && (
              <Button variant="default" size="sm" className="h-8 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all hover:scale-105">
                <Zap className="w-3.5 h-3.5 mr-1.5 fill-current text-yellow-400" />
                Upgrade
              </Button>
            )}
          </div>
        )}

        <input 
          type="file" 
          accept="audio/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          disabled={isLimitReached}
        />

        <div className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 transition-all ${isLimitReached ? 'bg-gray-100 opacity-60 border-gray-200' : 'bg-gray-50/50 hover:bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
          <Button 
            type="button" 
            variant="secondary" 
            className="shrink-0 font-semibold shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLimitReached}
          >
            Choose Audio
          </Button>
          <span className="text-sm text-gray-500 truncate pr-2 font-medium">
            {file ? file.name : "Drop file here or click"}
          </span>
        </div>

        <Button 
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5" 
          onClick={handleUpload} 
          disabled={loading || !file || isLimitReached}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing with AI...
            </>
          ) : isLimitReached ? (
            "Limit Reached"
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Transcribe & Analyze
            </>
          )}
        </Button>

        {transcription && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {analysis && (
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest flex items-center mb-3">
                  <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                  AI Summary & Insights
                </h3>
                <div className="text-sm text-indigo-950/80 leading-relaxed whitespace-pre-wrap font-medium">
                  {analysis}
                </div>
              </div>
            )}

            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  Raw Transcript
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full" 
                  onClick={copyToClipboard}
                >
                  {copiedText ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {transcription}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}