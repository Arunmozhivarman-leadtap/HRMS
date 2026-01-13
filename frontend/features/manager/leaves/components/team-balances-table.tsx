"use client"

import { useTeamLeaveBalances } from "@/features/leaves/hooks/use-leaves"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

export function TeamBalancesTable() {
    const { data: balances, isLoading } = useTeamLeaveBalances()

    if (isLoading) {
        return <div className="p-4 text-center">Loading balances...</div>
    }

    if (!balances || balances.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No team balances found.</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Balances</CardTitle>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {balances.map((balance) => (
                            <TableRow key={balance.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <span>{balance.employee?.full_name || `Employee ${balance.employee_id}`}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{balance.leave_type.name.replace(/_/g, ' ')}</TableCell>
                                <TableCell className="text-right font-bold text-emerald-600">{balance.available}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{balance.taken}</TableCell>
                                <TableCell className="text-right text-amber-600">{balance.pending_approval}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
