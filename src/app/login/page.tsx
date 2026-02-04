"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Hexagon } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        if (!auth) {
            setError("ระบบยังไม่ได้เชื่อมต่อกับ Firebase (Missing Configuration)");
            setIsLoading(false);
            return;
        }

        try {
            await signInWithPopup(auth, googleProvider);
            // On success, redirect to dashboard
            router.push("/");
        } catch (err: any) {
            console.error("Login Error:", err);
            setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่: " + (err.message || "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-[#0a192f] to-[#002d62]">
            {/* Card Container */}
            <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10 text-center">

                {/* Logo & Title */}
                <div className="flex flex-col items-center mb-10">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                        <img
                            src="/logo.jpg"
                            alt="Logo"
                            className="relative h-20 w-20 object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-widest mb-2">
                        EVOLUTION HRD SYSTEM
                    </h1>
                    <p className="text-gray-400 text-sm font-light">
                        เข้าสู่ระบบเพื่อจัดการธุรกิจของคุณ
                    </p>
                </div>

                {/* Login Action */}
                <div className="space-y-4">
                    <Button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {/* Google Icon SVG */}
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#FFFFFF"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#FFFFFF"
                                fillOpacity="0.7" // Tinting Google colors to white to match button style request or keep original. 
                            // User asked for "Google Logo" usually implies standard colors, 
                            // but also "Blue Button with White Text". 
                            // Often Google buttons are White with colored G.
                            // BUT User specific request: "Style: สีน้ำเงินสด (bg-blue-600)..."
                            // So I'll use a white mono icon or keep colors if it looks okay.
                            // Let's use a white path for contrast on blue button.
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z"
                                fill="#FFFFFF"
                                fillOpacity="0.6"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#FFFFFF"
                                fillOpacity="0.8"
                            />
                        </svg>
                        {isLoading ? "Connecting..." : "Connect with Google"}
                    </Button>

                    {error && (
                        <p className="text-red-400 text-sm mt-4 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-xs text-gray-500">
                    &copy; 2026 Evolution HRD. All rights reserved.
                </div>
            </div>
        </div>
    );
}
