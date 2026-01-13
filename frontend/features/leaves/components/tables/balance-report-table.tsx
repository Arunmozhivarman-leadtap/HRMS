
"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { LeaveBalance } from "@/types/leave"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface BalanceReportTableProps {
    data: LeaveBalance[]
}

export function BalanceReportTable({ data }: BalanceReportTableProps) {
    const [searchTerm, setSearchTerm] = useState("")

    // 1. Extract Unique Leave Types
    const leaveTypes = Array.from(new Set(data.map(b => b.leave_type.abbr))).sort();

    // 2. Pivot Data: Group by Employee
    const pivotedData: Record<number, {
        name: string,
        code: string,
        gender?: string,
        balances: Record<string, number>,
        leaves: Record<string, LeaveBalance['leave_type']> // specific LeaveType info
    }> = {};

    data.forEach(balance => {
        if (!balance.employee) return;

        if (!pivotedData[balance.employee_id]) {
            pivotedData[balance.employee_id] = {
                name: balance.employee.full_name,
                code: balance.employee.employee_code || `EMP${balance.employee_id}`,
                gender: balance.employee.gender,
                balances: {},
                leaves: {}
            };
        }
        pivotedData[balance.employee_id].balances[balance.leave_type.abbr] = balance.available;
        pivotedData[balance.employee_id].leaves[balance.leave_type.abbr] = balance.leave_type;
    });

    // 3. Convert to Array and Filter
    const rows = Object.values(pivotedData)
        .filter(row =>
            row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-serif font-medium text-foreground">Employee Leave Balances</CardTitle>
                    <CardDescription>Current available balance for all employees.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search employee..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-[250px] h-9 text-sm"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="overflow-auto max-h-[600px] flex-1">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
                            <tr className="border-b border-border/40">
                                <th className="h-10 px-6 align-middle font-semibold">Code</th>
                                <th className="h-10 px-6 align-middle font-semibold">Employee Name</th>
                                {leaveTypes.map(type => (
                                    <th key={type} className="h-10 px-6 align-middle text-center font-bold">{type}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <tr key={row.code} className="transition-colors hover:bg-muted/30">
                                        <td className="p-6 align-middle font-mono text-xs text-muted-foreground">{row.code}</td>
                                        <td className="p-6 align-middle font-medium text-foreground">{row.name}</td>
                                        {leaveTypes.map(typeAbbr => {
                                            const typeInfo = row.leaves[typeAbbr]; // Get strict LeaveType info
                                            const val = row.balances[typeAbbr];

                                            // Gender Check Logic
                                            let isEligible = true;

                                            if (typeInfo) {
                                                const empGender = (row.gender || '').toLowerCase().trim();
                                                const typeName = (typeInfo.name || '').toString().toLowerCase();
                                                const typeAbbrStr = (typeInfo.abbr || '').toString().toLowerCase();
                                                const eligibility = (typeInfo.gender_eligibility || 'All').toLowerCase().trim();

                                                // 1. Check DB Configuration
                                                if (empGender) {
                                                    if (eligibility === 'female' && empGender !== 'female') isEligible = false;
                                                    if (eligibility === 'male' && empGender !== 'male') isEligible = false;
                                                }

                                                // 2. Strict Business Logic (Name-based override)
                                                if (typeName.includes('maternity') || typeAbbrStr === 'ml') {
                                                    if (empGender !== 'female') isEligible = false;
                                                }
                                                if (typeName.includes('paternity') || typeAbbrStr === 'pl') {
                                                    if (empGender !== 'male') isEligible = false;
                                                }
                                            }

                                            return (
                                                <td key={typeAbbr} className="p-6 align-middle text-center">
                                                    {isEligible && val !== undefined ? (
                                                        <span className={val < 0 ? "text-red-500 font-bold" : (val === 0 ? "text-muted-foreground" : "")}>
                                                            {val}
                                                        </span>
                                                    ) : "-"}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={leaveTypes.length + 2} className="p-10 text-center text-muted-foreground">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
