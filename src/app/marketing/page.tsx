"use client";

import { MarketingAnalytics } from "@/components/dashboard/MarketingAnalytics";

export const dynamic = 'force-dynamic';

export default function MarketingPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์การตลาด (Marketing Analytics)</h1>
            </div>
            <MarketingAnalytics />
        </div>
    );
}
