"use client"

import { useAllLeaveApplications } from "@/features/leaves/hooks/use-leaves"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AllRequestsTable() {
    const { data: applications, isLoading } = useAllLeaveApplications()

    if (isLoading) {
        return <div className="p-4 text-center">Loading all requests...</div>
    }

    if (!applications || applications.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No leave applications found.</div>
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200"
            case "rejected": return "bg-red-100 text-red-700 border-red-200"
            case "pending": return "bg-amber-100 text-amber-700 border-amber-200"
            case "cancelled": return "bg-zinc-100 text-zinc-700 border-zinc-200"
            default: return "bg-zinc-100 text-zinc-700"
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Leave Requests</CardTitle>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Applied On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{app.employee_name}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-sm">{app.leave_type_name}</TableCell>
                                <TableCell>{app.number_of_days} Days</TableCell>
                                <TableCell className="text-sm">
                                    {format(parseISO(app.from_date), 'MMM d, yyyy')}
                                    {app.to_date && app.to_date !== app.from_date && ` - ${format(parseISO(app.to_date), 'MMM d, yyyy')}`}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`capitalize ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {format(parseISO(app.created_at), 'MMM d')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
