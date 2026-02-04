"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";

const dataKPI = [
    { name: "Score", value: 75 },
    { name: "Remaining", value: 25 },
];
const COLORS_KPI = ["#10b981", "#e5e7eb"]; // Green and Gray

export function MarketingKPI() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">การตลาด & KPI</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>คะแนน KPI เฉลี่ย</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dataKPI}
                                        cx="50%"
                                        cy="80%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={80}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        {dataKPI.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_KPI[index % COLORS_KPI.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-[70%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <div className="text-4xl font-bold text-emerald-600">75%</div>
                                <div className="text-sm text-gray-500">ดีเยี่ยม</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ผลตอบแทนค่าโฆษณา (ROAS)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-[240px]">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-blue-600 mb-2">4.5x</div>
                            <p className="text-lg text-muted-foreground">Return on Ad Spend</p>
                            <div className="mt-4 flex justify-around text-sm">
                                <div>
                                    <p className="text-gray-500">ค่าโฆษณา</p>
                                    <p className="font-semibold">฿10,000</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">รายรับ</p>
                                    <p className="font-semibold">฿45,000</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
