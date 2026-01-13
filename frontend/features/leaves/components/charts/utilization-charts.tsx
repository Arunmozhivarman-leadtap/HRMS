
"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UtilizationChartsProps {
    departmentData: { department: string; days: number }[]
    typeData: { type: string; days: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function DepartmentChart({ data }: { data: { department: string; days: number }[] }) {
    return (
        <Card className="flex flex-col h-[400px]">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-base font-medium">Department Utilization</CardTitle>
                <CardDescription>Distribution of leave days by department</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="days"
                            nameKey="department"
                            strokeWidth={5}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#1e293b' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function LeaveTypeChart({ data }: { data: { type: string; days: number }[] }) {
    return (
        <Card className="flex flex-col h-[400px]">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-base font-medium">Leave Type Distribution</CardTitle>
                <CardDescription>Distribution of leave days by type</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#82ca9d"
                            paddingAngle={5}
                            dataKey="days"
                            nameKey="type"
                            strokeWidth={5}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#1e293b' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
