"use client"

import { useAllLeaveBalances } from "@/features/leaves/hooks/use-leaves"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function AllBalancesTable() {
    const { data: balances, isLoading } = useAllLeaveBalances()
    const [search, setSearch] = useState("")

    if (isLoading) {
        return <div className="p-4 text-center">Loading balances...</div>
    }

    const filteredBalances = balances?.filter(b => 
        b.employee?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        b.leave_type.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Employee Leave Balances</CardTitle>
                    <CardDescription>Real-time credits for all employees across all types.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employee..."
                            className="pl-8 w-[250px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead className="text-right">Available</TableHead>
                            <TableHead className="text-right">Taken</TableHead>
                            <TableHead className="text-right">Pending</TableHead>
                            <TableHead className="text-right">Accrued (YTD)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBalances?.map((balance) => (
                            <TableRow key={balance.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{balance.employee?.full_name || `ID: ${balance.employee_id}`}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize text-xs">{balance.leave_type.name.replace(/_/g, ' ')}</TableCell>
                                <TableCell className="text-right font-bold text-emerald-600">{balance.available}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{balance.taken}</TableCell>
                                <TableCell className="text-right text-amber-600">{balance.pending_approval}</TableCell>
                                <TableCell className="text-right text-zinc-500">{balance.accrued}</TableCell>
                            </TableRow>
                        ))}
                        {filteredBalances?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                                    No records found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
