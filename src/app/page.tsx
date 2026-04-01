"use client"; 

import { useState } from "react";
import { SignInButton, Show, UserButton } from '@clerk/nextjs';
import AudioUploader from '@/components/AudioUploader';
import HistoryList from '@/components/HistoryList';

export default function Home() {
  const [historyKey, setHistoryKey] = useState(0);

  const refreshHistory = () => {
    setHistoryKey(prev => prev + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">AI Audio MVP</h1>
      
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border">
            <UserButton />
            <p className="text-lg font-medium text-gray-700">You are successfully signed in!</p>
          </div>

          <AudioUploader onUploadSuccess={refreshHistory} />

          <HistoryList key={historyKey} />
        </div>
      </Show>
    </main>
  );
}