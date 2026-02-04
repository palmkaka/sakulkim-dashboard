"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { SalesForm } from "@/components/forms/SalesForm";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { EmployeeMasterForm } from "@/components/forms/EmployeeMasterForm";
import { PayrollForm } from "@/components/forms/PayrollForm";
import { MarketingForm } from "@/components/forms/MarketingForm";
import { DepartmentKPIForm } from "@/components/forms/DepartmentKPIForm";

function InputPageContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    const getTabFromParam = (param: string | null) => {
        switch (param) {
            case "Revenue": return "sales";
            case "Expenses": return "expenses";
            case "Employee": return "hr-master";
            case "Payroll": return "payroll";
            case "DepartmentKPI": return "department-kpi";
            case "Marketing": return "marketing";
            default: return "sales";
        }
    };

    const [activeTab, setActiveTab] = useState("sales");

    useEffect(() => {
        if (tabParam) {
            setActiveTab(getTabFromParam(tabParam));
        }
    }, [tabParam]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">บันทึกข้อมูล (Data Entry)</h1>
            </div>

            <Tabs className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto md:h-10 mb-6 gap-2 md:gap-0">
                    <TabsTrigger value="sales" activeValue={activeTab} onValueChange={handleTabChange}>ยอดขาย</TabsTrigger>
                    <TabsTrigger value="expenses" activeValue={activeTab} onValueChange={handleTabChange}>ค่าใช้จ่าย</TabsTrigger>
                    <TabsTrigger value="hr-master" activeValue={activeTab} onValueChange={handleTabChange}>ข้อมูลพนักงาน</TabsTrigger>
                    <TabsTrigger value="payroll" activeValue={activeTab} onValueChange={handleTabChange}>เงินเดือน</TabsTrigger>
                    <TabsTrigger value="department-kpi" activeValue={activeTab} onValueChange={handleTabChange}>KPI แผนก</TabsTrigger>
                    <TabsTrigger value="marketing" activeValue={activeTab} onValueChange={handleTabChange}>การตลาด</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" activeValue={activeTab}>
                    <SalesForm />
                </TabsContent>

                <TabsContent value="expenses" activeValue={activeTab}>
                    <ExpenseForm />
                </TabsContent>

                <TabsContent value="hr-master" activeValue={activeTab}>
                    <EmployeeMasterForm />
                </TabsContent>

                <TabsContent value="payroll" activeValue={activeTab}>
                    <PayrollForm />
                </TabsContent>

                <TabsContent value="department-kpi" activeValue={activeTab}>
                    <DepartmentKPIForm />
                </TabsContent>

                <TabsContent value="marketing" activeValue={activeTab}>
                    <MarketingForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function InputPage() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <InputPageContent />
        </Suspense>
    );
}
