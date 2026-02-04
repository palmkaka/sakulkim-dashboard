"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { Megaphone, TrendingUp, PieChart } from "lucide-react";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

// Mock Data
const marketingData = [
    { name: "Jan", spend: 4000, revenue: 24000 },
    { name: "Feb", spend: 3000, revenue: 13980 },
    { name: "Mar", spend: 2000, revenue: 98000 },
    { name: "Apr", spend: 2780, revenue: 39080 },
    { name: "May", spend: 1890, revenue: 48000 },
    { name: "Jun", spend: 2390, revenue: 38000 },
];

export function MarketingAnalytics() {
    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">งบโฆษณารวม (Total Ad Spend)</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿16,060</div>
                        <p className="text-xs text-muted-foreground">YTD Spend</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ROAS (Revenue/Spend)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">6.5x</div>
                        <p className="text-xs text-muted-foreground">Very Healthy (&gt;4x)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">% Budget Used</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45%</div>
                        <p className="text-xs text-muted-foreground">Of allocated budget</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-1">
                {/* Spend vs Revenue (Composed) */}
                <Card>
                    <CardHeader>
                        <CardTitle>ประสิทธิภาพการตลาด (Spend vs Revenue)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={marketingData}>
                                    <CartesianGrid stroke="#f5f5f5" vertical={false} />
                                    <XAxis dataKey="name" scale="band" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" orientation="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                                    <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="spend" barSize={40} fill="#94a3b8" name="Ad Spend" radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} name="Revenue Generated" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">แคมเปญล่าสุด</h3>
                <RecentHistory
                    collectionName="marketing"
                    mapData={(data) => ({
                        date: data.launchDate || "N/A",
                        detail: `${data.campaignName} (${data.platform})`,
                        amount: data.budget,
                    })}
                />
            </div>
        </div>
    );
}
