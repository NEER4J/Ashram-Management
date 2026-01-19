"use client"

import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10" style={{ backgroundColor: "#fbf9ef" }}>
      <div className="w-full max-w-sm">
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c0212] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
