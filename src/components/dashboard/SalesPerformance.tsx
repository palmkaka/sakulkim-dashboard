"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { Trophy } from "lucide-react";

const dataTargetVsActual = [
    { name: "Jan", target: 4000, actual: 2400 },
    { name: "Feb", target: 3000, actual: 1398 },
    { name: "Mar", target: 2000, actual: 9800 },
    { name: "Apr", target: 2780, actual: 3908 },
    { name: "May", target: 1890, actual: 4800 },
    { name: "Jun", target: 2390, actual: 3800 },
];

const dataSalesChannel = [
    { name: "หน้าร้าน", value: 400 },
    { name: "ค้าส่ง", value: 300 },
    { name: "ออนไลน์", value: 300 },
    { name: "โครงการ", value: 200 },
];

const topSales = [
    { name: "สมชาย ใจดี", sales: 1250000, img: "/avatars/01.png" },
    { name: "สมหญิง รักงาน", sales: 950000, img: "/avatars/02.png" },
    { name: "วิชัย ไอที", sales: 880000, img: "/avatars/03.png" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function SalesPerformance() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">ประสิทธิภาพการขาย</h2>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Main Bar Chart (4 columns) */}
                <Card className="col-span-4 md:col-span-4">
                    <CardHeader>
                        <CardTitle>เป้าหมาย vs ยอดจริง</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataTargetVsActual}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `฿${value}`}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="actual" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Side Column (3 columns): Pie Chart + Leaderboard */}
                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">ยอดขายตามช่องทาง</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dataSalesChannel}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dataSalesChannel.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Top 3 นักขายยอดเยี่ยม</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topSales.map((sale, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{sale.name}</p>
                                                <p className="text-xs text-muted-foreground">{index === 0 ? "👑 Leader" : "Rising Star"}</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm">฿{(sale.sales / 1000000).toFixed(2)}M</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
