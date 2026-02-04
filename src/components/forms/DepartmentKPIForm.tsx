"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have this, if not I'll fallback to textarea
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

type DepartmentKPIData = {
    monthYear: string;
    department: string;
    kpiScore: number;
    note: string;
};

export function DepartmentKPIForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DepartmentKPIData>();

    const onSubmit = async (data: DepartmentKPIData) => {
        console.log("Department KPI Data:", data);
        try {
            if (db) {
                await addDoc(collection(db, "department_kpis"), {
                    ...data,
                    kpiScore: Number(data.kpiScore),
                    createdAt: serverTimestamp()
                });
                alert("บันทึก KPI แผนกเรียบร้อย");
                reset();
            } else {
                alert("Database not connected");
            }
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>ประเมิน KPI รายแผนก (Department KPI)</CardTitle>
                    <CardDescription>บันทึกคะแนนประสิทธิภาพประจำเดือน</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">เดือน/ปี (Month/Year)</label>
                                <Input type="month" {...register("monthYear", { required: true })} />
                                {errors.monthYear && <span className="text-red-500 text-xs">ระบุเดือน</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">แผนก (Department)</label>
                                <Select {...register("department", { required: true })}>
                                    <option value="Sales">ฝ่ายขาย (Sales)</option>
                                    <option value="IT">ไอที (IT)</option>
                                    <option value="HR">บุคคล (HR)</option>
                                    <option value="Finance">การเงิน (Finance)</option>
                                    <option value="Marketing">การตลาด (Marketing)</option>
                                    <option value="Operation">ปฏิบัติการ (Operation)</option>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">คะแนน KPI (0-100 หรือ 1-5)</label>
                            <Input
                                type="number"
                                placeholder="เช่น 85 หรือ 4.5"
                                {...register("kpiScore", { required: true, min: 0 })}
                            />
                            {errors.kpiScore && <span className="text-red-500 text-xs">ระบุคะแนน</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">เหตุผล/สิ่งที่ทำได้ดี (Note)</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="ระบุรายละเอียด..."
                                {...register("note")}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">บันทึก KPI</Button>
                    </form>
                </CardContent>
            </Card>

            <RecentHistory
                collectionName="department_kpis"
                mapData={(data) => ({
                    date: data.monthYear,
                    detail: `${data.department} (KPI: ${data.kpiScore})`,
                    amount: "-",
                })}
            />
        </>
    );
}
