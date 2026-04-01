"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an audio file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      // Сначала читаем текст ответа, чтобы понять, что там
      const textResponse = await res.text();
      
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Server returned non-JSON response:", textResponse);
        throw new Error("Server error: Check VS Code console for details.");
      }

      if (!res.ok) throw new Error(data.error || "Error processing audio");

      toast.success("Done! Text obtained.");
      console.log("Result:", data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-gray-100">
      <CardHeader className="text-center pb-2 items-center flex flex-col">
        <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">Upload Audio</CardTitle>
        <CardDescription className="text-base text-gray-500 mt-1">
          (1 Free Attempt)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">

        <input 
          type="file" 
          accept="audio/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />

        <div className="w-full flex items-center h-14 gap-3 border border-gray-200 rounded-lg p-1.5 bg-gray-50 shadow-inner">
          <Button 
            type="button" 
            variant="secondary" 
            className="shrink-0 h-11 px-5 rounded-md border-gray-300 bg-white font-medium hover:bg-gray-100 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
          <span className="text-sm text-gray-600 truncate flex-grow pr-3">
            {file ? file.name : "No file chosen"}
          </span>
        </div>

        <Button 
          size="lg"
          className="w-full h-12 rounded-xl text-lg font-semibold transition-all" 
          onClick={handleUpload} 
          disabled={loading || !file}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing audio...
            </div>
          ) : (
            "Convert to Text"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}