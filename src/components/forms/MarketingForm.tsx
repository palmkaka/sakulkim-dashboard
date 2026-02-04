"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

type MarketingTargetData = {
    monthYear: string;
    adSpend: number;
    salesTarget: number;
    kpiScore: number;
};

export function MarketingForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MarketingTargetData>();

    const onSubmit = async (data: MarketingTargetData) => {
        console.log("Marketing Data:", data);
        try {
            if (db) {
                await addDoc(collection(db, "marketing"), {
                    ...data,
                    adSpend: Number(data.adSpend),
                    salesTarget: Number(data.salesTarget),
                    kpiScore: Number(data.kpiScore),
                    createdAt: serverTimestamp()
                });
                alert("บันทึกข้อมูลการตลาดเรียบร้อย");
                reset();
            } else {
                alert("Database not connected");
            }
        } catch (e) {
            console.error("Error: ", e);
            alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>การตลาดและเป้าหมาย (Marketing & Targets)</CardTitle>
                    <CardDescription>กำหนดงบประมาณและเป้าหมายรายเดือน</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">เดือน/ปี (Month/Year)</label>
                            <Input type="month" {...register("monthYear", { required: true })} />
                            {errors.monthYear && <span className="text-red-500 text-xs">ระบุเดือน</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">งบการตลาดรวม (Ad Spend)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    {...register("adSpend", { required: true, min: 0 })}
                                />
                                {errors.adSpend && <span className="text-red-500 text-xs">ระบุงบการตลาด</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">เป้าหมายยอดขาย (Sales Target)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    {...register("salesTarget", { required: true, min: 0 })}
                                />
                                {errors.salesTarget && <span className="text-red-500 text-xs">ระบุเป้าหมาย</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">คะแนน KPI แผนก (0-100 หรือ 1-5)</label>
                            <Input
                                type="number"
                                placeholder="เช่น 85 หรือ 4.5"
                                {...register("kpiScore", { required: true, min: 0, max: 100 })}
                            />
                            {errors.kpiScore && <span className="text-red-500 text-xs">ระบุคะแนน KPI</span>}
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">บันทึกเป้าหมาย</Button>
                    </form>
                </CardContent>
            </Card>

            <RecentHistory
                collectionName="marketing"
                mapData={(data) => ({
                    date: data.monthYear,
                    detail: "เป้าหมายการขาย",
                    amount: data.salesTarget,
                })}
            />
        </>
    );
}
