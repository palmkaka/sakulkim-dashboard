"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { db } from "@/lib/firebase"; // Import db (even if unused, to show intention)
// import { collection, addDoc } from "firebase/firestore";

type TransactionData = {
    date: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    description?: string;
};

export function TransactionForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TransactionData>();

    const onSubmit = async (data: TransactionData) => {
        console.log("ข้อมูลธุรกรรม:", data);
        try {
            // Placeholder for Firebase submission
            // await addDoc(collection(db, "transactions"), data);
            alert("บันทึกข้อมูลเรียบร้อย (ตรวจสอบ console สำหรับข้อมูล)");
            reset();
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>บันทึกธุรกรรมใหม่</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">วันที่</label>
                            <Input type="date" {...register("date", { required: true })} />
                            {errors.date && <span className="text-red-500 text-xs">จำเป็นต้องระบุ</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ประเภท</label>
                            <Select {...register("type", { required: true })}>
                                <option value="income">รายรับ</option>
                                <option value="expense">รายจ่าย</option>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">จำนวนเงิน</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            {...register("amount", { required: true, min: 0 })}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">จำเป็นต้องระบุ</span>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">หมวดหมู่</label>
                        <Input placeholder="เช่น ขายสินค้า, ค่าเช่า, การตลาด" {...register("category", { required: true })} />
                        {errors.category && <span className="text-red-500 text-xs">จำเป็นต้องระบุ</span>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">คำอธิบาย</label>
                        <Input placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" {...register("description")} />
                    </div>
                    <Button type="submit" className="w-full">บันทึกรายการ</Button>
                </form>
            </CardContent>
        </Card>
    );
}
