"use client";

import { useState } from "react";
import {
    Plus,
    TrendingUp,
    CreditCard,
    Users,
    Wallet,
    Target,
    Megaphone
} from "lucide-react";
import { auth } from "@/lib/firebase"; // Import Auth
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

// Import Forms
import { SalesForm } from "@/components/forms/SalesForm";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { EmployeeMasterForm } from "@/components/forms/EmployeeMasterForm";
import { PayrollForm } from "@/components/forms/PayrollForm";
import { DepartmentKPIForm } from "@/components/forms/DepartmentKPIForm";
import { MarketingForm } from "@/components/forms/MarketingForm";

export function Header() {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // State to manage specific form modals
    const [openForm, setOpenForm] = useState<string | null>(null);

    const handleOpenForm = (formName: string) => {
        setIsQuickAddOpen(false); // Close selection modal
        setOpenForm(formName);
    };

    return (
        <>
            {/* Quick Add Selection Modal */}
            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>เลือกรายการที่ต้องการบันทึก</DialogTitle>
                        <DialogDescription>
                            Select data entry type
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleOpenForm("sales")}
                        >
                            <TrendingUp className="h-8 w-8" />
                            <span className="font-semibold">ยอดขาย (Sales)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleOpenForm("expenses")}
                        >
                            <CreditCard className="h-8 w-8" />
                            <span className="font-semibold">ค่าใช้จ่าย (Expenses)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50"
                            onClick={() => handleOpenForm("marketing")}
                        >
                            <Megaphone className="h-8 w-8" />
                            <span className="font-semibold">การตลาด (Marketing)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenForm("hr")}
                        >
                            <Users className="h-8 w-8" />
                            <span className="font-semibold">พนักงาน (HR)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            onClick={() => handleOpenForm("payroll")}
                        >
                            <Wallet className="h-8 w-8" />
                            <span className="font-semibold">เงินเดือน (Payroll)</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50"
                            onClick={() => handleOpenForm("kpi")}
                        >
                            <Target className="h-8 w-8" />
                            <span className="font-semibold">KPI แผนก</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sales Form Modal */}
            <Dialog open={openForm === "sales"} onOpenChange={(open) => setOpenForm(open ? "sales" : null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>บันทึกยอดขาย (Sales Entry)</DialogTitle>
                    </DialogHeader>
                    <SalesForm />
                </DialogContent>
            </Dialog>

            {/* Expense Form Modal */}
            <Dialog open={openForm === "expenses"} onOpenChange={(open) => setOpenForm(open ? "expenses" : null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>บันทึกค่าใช้จ่าย (Expense Entry)</DialogTitle>
                    </DialogHeader>
                    <ExpenseForm />
                </DialogContent>
            </Dialog>

            {/* HR Form Modal */}
            <Dialog open={openForm === "hr"} onOpenChange={(open) => setOpenForm(open ? "hr" : null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>ข้อมูลพนักงาน (Employee Master)</DialogTitle>
                    </DialogHeader>
                    <EmployeeMasterForm />
                </DialogContent>
            </Dialog>

            {/* Payroll Form Modal */}
            <Dialog open={openForm === "payroll"} onOpenChange={(open) => setOpenForm(open ? "payroll" : null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>บันทึกเงินเดือน (Payroll)</DialogTitle>
                    </DialogHeader>
                    <PayrollForm />
                </DialogContent>
            </Dialog>

            {/* KPI Form Modal */}
            <Dialog open={openForm === "kpi"} onOpenChange={(open) => setOpenForm(open ? "kpi" : null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>บันทึก KPI แผนก</DialogTitle>
                    </DialogHeader>
                    <DepartmentKPIForm />
                </DialogContent>
            </Dialog>

            {/* Marketing Form Modal */}
            <Dialog open={openForm === "marketing"} onOpenChange={(open) => setOpenForm(open ? "marketing" : null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>บันทึกข้อมูลการตลาด</DialogTitle>
                    </DialogHeader>
                    <MarketingForm />
                </DialogContent>
            </Dialog>

            {/* Header Bar */}
            <header className="flex h-16 items-center justify-between md:justify-end px-4 md:px-6 border-b bg-white gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 border-indigo-200 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={() => setIsQuickAddOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> เพิ่มข้อมูล
                </Button>

                <div className="flex items-center gap-3 md:border-l md:pl-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium leading-none">
                            {auth.currentUser?.displayName || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {auth.currentUser?.email || "No email"}
                        </p>
                    </div>
                    <Avatar>
                        <AvatarImage src={auth.currentUser?.photoURL || ""} alt={auth.currentUser?.displayName || "User"} />
                        <AvatarFallback>
                            {auth.currentUser?.displayName ? auth.currentUser.displayName.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                    {/* Add Sign Out Button for convenience */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => auth.signOut()}
                        className="text-gray-400 hover:text-red-500"
                        title="Sign Out"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    </Button>
                </div>
            </header>
        </>
    );
}
