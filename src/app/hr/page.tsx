"use client";

import { HRAnalytics } from "@/components/dashboard/HRAnalytics";

export const dynamic = 'force-dynamic';

export default function HRPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์ทรัพยากรบุคคล (HR Analytics)</h1>
            </div>
            <HRAnalytics />
        </div>
    );
}
