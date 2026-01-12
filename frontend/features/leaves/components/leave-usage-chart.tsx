"use client"

import { useLeaveStats } from "../hooks/use-leaves"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Loader2, PieChart } from "lucide-react"

export function LeaveUsageChart() {
    const { data: stats, isLoading } = useLeaveStats(new Date().getFullYear())

    if (isLoading) return <div className="h-80 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

    const chartData = Object.entries(stats?.taken_by_type || {}).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
    }))

    const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

    return (
        <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                        <PieChart className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Usage Analytics</CardTitle>
                        <CardDescription className="text-xs">Approved leave days by category this year.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis 
                                dataKey="name" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--background))', 
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
