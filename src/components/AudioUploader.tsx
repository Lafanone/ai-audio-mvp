"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState<string>(""); // Состояние для текста
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (e) {
        throw new Error("Server error: check console");
      }

      if (!res.ok) throw new Error(data.error || "Error processing audio");

      setTranscription(data.text);
      toast.success("Done! Text obtained.");
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

  return (
    <Card className="w-full max-w-md shadow-sm border-gray-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800">Audio to Text</CardTitle>
        <p className="text-sm text-gray-500 mt-1">(AI processing via OpenAI)</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <input 
          type="file" 
          accept="audio/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />

        <div className="flex items-center gap-3 border rounded-md p-2 bg-gray-50/50">
          <Button 
            type="button" 
            variant="secondary" 
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
          <span className="text-sm text-gray-500 truncate pr-2">
            {file ? file.name : "No file chosen"}
          </span>
        </div>

        <Button 
          className="w-full h-11" 
          onClick={handleUpload} 
          disabled={loading || !file}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
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