"use client"

import { useLeaveAnalytics } from "@/features/leaves/hooks/use-leaves"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts"
import { Loader2, TrendingUp, Users, AlertCircle, Banknote, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeaveAnalytics() {
    const { data: analytics, isLoading } = useLeaveAnalytics()

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!analytics) return null

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leave Liability (EL)</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.liability.total_el_days.toFixed(1)} Days</div>
                        <p className="text-xs text-muted-foreground">Total outstanding Earned Leave</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total LOP (YTD)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.liability.total_lop_days.toFixed(1)} Days</div>
                        <p className="text-xs text-muted-foreground">Loss of Pay organization-wide</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Monthly Leave Trend</CardTitle>
                        <CardDescription>Leaves taken month over month</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={analytics.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    tickFormatter={(val) => {
                                        const date = new Date();
                                        date.setMonth(val - 1);
                                        return date.toLocaleString('default', { month: 'short' });
                                    }}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={(val) => {
                                        const date = new Date();
                                        date.setMonth(val - 1);
                                        return date.toLocaleString('default', { month: 'long' });
                                    }}
                                />
                                <Line type="monotone" dataKey="days" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Department Utilization</CardTitle>
                        <CardDescription>Total leave days by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={analytics.department_utilization}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="days"
                                    nameKey="department"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {analytics.department_utilization.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Utilization by Type</CardTitle>
                        <CardDescription>Breakdown of leaves by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.type_utilization} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis 
                                    dataKey="type" 
                                    type="category" 
                                    width={100} 
                                    tickFormatter={(val) => val.replace(/_/g, ' ').toUpperCase()} 
                                    fontSize={10}
                                />
                                <Tooltip formatter={(val: number) => [`${val} Days`, 'Used']} />
                                <Bar dataKey="days" fill="#2563eb" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>High Absenteeism Risk</CardTitle>
                        <CardDescription>Top employees with high LOP/Sick Leave usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.top_absentees.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No significant absenteeism data.</p>
                            ) : (
                                analytics.top_absentees.map((item, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 border">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Sick/LOP Usage</p>
                                        </div>
                                        <div className="ml-auto font-medium text-rose-600">
                                            {item.days.toFixed(1)} Days
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Organization Balance Summary</CardTitle>
                            <CardDescription>Consolidated view of all employee leave credits.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open('/api/leaves/balances/all', '_blank')}>
                            <Download className="mr-2 h-4 w-4" /> Export All Balances
                        </Button>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground italic">Full interactive balance report table is accessible via the "All Requests" logic or separate export.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
