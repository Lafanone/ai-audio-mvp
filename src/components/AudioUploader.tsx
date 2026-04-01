"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Copy, Check, Zap } from "lucide-react";

const FREE_LIMIT = 5; 

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [copied, setCopied] = useState(false);
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
      toast.success("Done! Text obtained.");
      setUsageCount((prev) => prev + 1);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isLimitReached = !isPro && usageCount >= FREE_LIMIT;

  return (
    <Card className="w-full max-w-md shadow-sm border-gray-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800">Audio to Text</CardTitle>
        <p className="text-sm text-gray-500 mt-1">(AI processing via OpenAI)</p>
      </CardHeader>
      
      <CardContent className="space-y-6">

        {!fetchingUser && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {isPro ? "Pro Plan" : "Free Plan"}
              </span>
              <span className="text-sm font-medium text-gray-800 mt-0.5">
                {isPro ? "Unlimited uses" : `${usageCount} of ${FREE_LIMIT} uses`}
              </span>
            </div>
            {!isPro && (
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-blue-600 border-blue-200 hover:bg-blue-50">
                <Zap className="w-3 h-3 mr-1 fill-current" />
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

        <div className={`flex items-center gap-3 border rounded-md p-2 transition-colors ${isLimitReached ? 'bg-gray-100 opacity-60' : 'bg-gray-50/50'}`}>
          <Button 
            type="button" 
            variant="secondary" 
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLimitReached}
          >
            Choose File
          </Button>
          <span className="text-sm text-gray-500 truncate pr-2">
            {file ? file.name : "No file chosen"}
          </span>
        </div>

        <Button 
          className="w-full h-11 relative overflow-hidden" 
          onClick={handleUpload} 
          disabled={loading || !file || isLimitReached}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isLimitReached ? (
            "Limit Reached"
          ) : (
            "Convert to Text"
          )}
        </Button>

        {transcription && (
          <div className="mt-6 p-4 bg-white border border-blue-100 rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Transcription:</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
              </Button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-blue-50/30 p-3 rounded border border-blue-50">
              {transcription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}