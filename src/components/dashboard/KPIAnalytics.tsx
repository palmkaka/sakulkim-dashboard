"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import { Target, Trophy } from "lucide-react";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

// Mock Data
const deptRanking = [
    { name: "Sales", score: 92 },
    { name: "Marketing", score: 88 },
    { name: "Engineering", score: 85 },
    { name: "HR", score: 80 },
    { name: "Admin", score: 78 },
];

const scoreTrend = [
    { name: "Jan", score: 75 },
    { name: "Feb", score: 78 },
    { name: "Mar", score: 82 },
    { name: "Apr", score: 80 },
    { name: "May", score: 85 },
    { name: "Jun", score: 88 },
];

export function KPIAnalytics() {
    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">คะแนนเฉลี่ยองค์กร (Avg Score)</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">84.6%</div>
                        <p className="text-xs text-muted-foreground">+2.4% from last quarter</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">แผนกดีเด่น (Top Performer)</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600">Sales Team</div>
                        <p className="text-xs text-muted-foreground">Score: 92%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Department Ranking (Horizontal Bar) */}
                <Card className="col-span-4 pl-2">
                    <CardHeader>
                        <CardTitle>จัดลำดับคะแนนแผนก (Department Ranking)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={deptRanking} margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#666', fontSize: 12 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Score Trend (Line) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>แนวโน้มคะแนน (Score Trend)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scoreTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">ประวัติการประเมิน KPI</h3>
                <RecentHistory
                    collectionName="kpi"
                    mapData={(data) => ({
                        date: data.evaluationDate || "N/A",
                        detail: `${data.department} - ${data.topic}`,
                        amount: `${data.score}%`,
                    })}
                />
            </div>
        </div>
    );
}
