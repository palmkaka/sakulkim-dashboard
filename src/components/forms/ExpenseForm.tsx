"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

type ExpenseData = {
    date: string;
    category: string;
    amount: number;
    receipt?: FileList;
};

export function ExpenseForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExpenseData>();

    const onSubmit = async (data: ExpenseData) => {
        console.log("Expense Data:", data);
        try {
            if (db) {
                await addDoc(collection(db, "expenses"), {
                    ...data,
                    amount: Number(data.amount),
                    createdAt: serverTimestamp()
                });
                alert("บันทึกค่าใช้จ่ายเรียบร้อย");
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
                    <CardTitle>บันทึกค่าใช้จ่าย (Expenses)</CardTitle>
                    <CardDescription>ค่าใช้จ่ายดำเนินงานต่างๆ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">วันที่ (Date)</label>
                                <Input type="date" {...register("date", { required: true })} />
                                {errors.date && <span className="text-red-500 text-xs">ระบุวันที่</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">หมวดหมู่ (Category)</label>
                                <Select {...register("category", { required: true })}>
                                    <option value="Rent">ค่าเช่า/สถานที่</option>
                                    <option value="Utilities">ค่าน้ำ/ค่าไฟ</option>
                                    <option value="Supplies">อุปกรณ์สำนักงาน</option>
                                    <option value="Wage">ค่าจ้าง (จ้างเหมา)</option>
                                    <option value="Other">อื่นๆ</option>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">จำนวนเงิน (Amount)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                {...register("amount", { required: true, min: 0 })}
                            />
                            {errors.amount && <span className="text-red-500 text-xs">ระบุยอดเงิน</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">หลักฐาน/ใบเสร็จ (File Upload)</label>
                            <Input type="file" {...register("receipt")} className="cursor-pointer" />
                        </div>
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">บันทึกค่าใช้จ่าย</Button>
                    </form>
                </CardContent>
            </Card>

            <RecentHistory
                collectionName="expenses"
                mapData={(data) => ({
                    date: data.date,
                    detail: data.category,
                    amount: data.amount,
                })}
            />
        </>
    );
}
