"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    TrendingUp,
    CreditCard,
    Users,
    Wallet,
    Target,
    Megaphone,
    Menu,
    X,
    Hexagon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
    { name: "ภาพรวม (Overview)", icon: LayoutDashboard, href: "/" },
    { name: "ยอดขาย (Sales)", icon: TrendingUp, href: "/sales" },
    { name: "ค่าใช้จ่าย (Expenses)", icon: CreditCard, href: "/expenses" },
    { name: "พนักงาน (HR)", icon: Users, href: "/hr" },
    { name: "เงินเดือน (Payroll)", icon: Wallet, href: "/payroll" },
    { name: "KPI แผนก", icon: Target, href: "/kpi" },
    { name: "การตลาด (Marketing)", icon: Megaphone, href: "/marketing" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") return true;
        if (href !== "/" && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 z-50 p-4 w-full bg-white border-b flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-lg">
                    <img src="/logo.jpg" alt="Logo" className="h-8 w-8 object-contain rounded-md" />
                    <span>Sakulkim Dashboard</span>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:static md:block
                `}
            >
                <div className="flex h-full flex-col">
                    {/* Logo Section */}
                    <div className="flex h-16 items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-3 font-bold text-xl text-indigo-900">
                            {/* Logo removed as requested */}
                            <span>Sakulkim Dashboard</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)} // Close on mobile click
                                    className={`
                                        flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                                        ${active
                                            ? "bg-indigo-50 text-indigo-600"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-gray-500"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
