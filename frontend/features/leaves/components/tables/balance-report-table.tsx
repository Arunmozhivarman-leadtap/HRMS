
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

import { useAllLeaveBalances, useLeaveTypes } from "../../hooks/use-leaves"
import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"

export function BalanceReportTable() {
    const pagination = usePagination(10)
    const currentYear = new Date().getFullYear()

    const { data: leaveTypesData } = useLeaveTypes()
    const { data: balancesResponse, isLoading } = useAllLeaveBalances({
        skip: pagination.skip,
        limit: pagination.limit,
        search: pagination.search,
        year: currentYear
    })

    // 1. Extract Unique Leave Types from policy data (for columns)
    const leaveTypes = leaveTypesData?.map(lt => lt.abbr).sort() || []

    // 2. Pivot Data: Group by Employee
    const pivotedData: Record<number, {
        id: number,
        name: string,
        code: string,
        gender?: string,
        balances: Record<string, number>,
        leaves: Record<string, any>
    }> = {};

    balancesResponse?.items.forEach(balance => {
        if (!balance.employee) return;

        if (!pivotedData[balance.employee_id]) {
            pivotedData[balance.employee_id] = {
                id: balance.employee_id,
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

    const rows = Object.values(pivotedData).sort((a, b) => a.name.localeCompare(b.name))

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
        },
        {
            accessorKey: "name",
            header: "Employee Name",
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
        },
        ...leaveTypes.map(type => ({
            id: `type-${type}`,
            header: () => <div className="text-center font-bold">{type}</div>,
            cell: ({ row }: { row: any }) => {
                const pivotedRow = row.original;
                const typeInfo = pivotedRow.leaves[type];
                const val = pivotedRow.balances[type];

                let isEligible = true;
                if (typeInfo) {
                    const empGender = (pivotedRow.gender || '').toLowerCase().trim();
                    const typeName = (typeInfo.name || '').toString().toLowerCase();
                    const typeAbbrStr = (typeInfo.abbr || '').toString().toLowerCase();
                    const eligibility = (typeInfo.gender_eligibility || 'All').toLowerCase().trim();

                    if (empGender) {
                        if (eligibility === 'female' && empGender !== 'female') isEligible = false;
                        if (eligibility === 'male' && empGender !== 'male') isEligible = false;
                    }
                    if (typeName.includes('maternity') || typeAbbrStr === 'ml') {
                        if (empGender !== 'female') isEligible = false;
                    }
                    if (typeName.includes('paternity') || typeAbbrStr === 'pl') {
                        if (empGender !== 'male') isEligible = false;
                    }
                }

                if (!isEligible || val === undefined) return <div className="text-center text-muted-foreground">-</div>;

                return (
                    <div className="text-center">
                        <span className={val < 0 ? "text-red-500 font-bold" : (val === 0 ? "text-muted-foreground" : "")}>
                            {val}
                        </span>
                    </div>
                );
            }
        }))
    ]

    return (
        <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
            <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-xl font-serif font-medium text-foreground">Employee Leave Balances</CardTitle>
                <CardDescription>Current available balance for all active employees.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                <DataTable
                    columns={columns}
                    data={rows}
                    totalCount={balancesResponse?.total || 0}
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.onPageChange}
                    onPageSizeChange={pagination.onPageSizeChange}
                    onSearch={pagination.onSearch}
                    isLoading={isLoading}
                    searchPlaceholder="Search employees..."
                    hasBorder={false}
                />
            </CardContent>
        </Card>
    )
}
