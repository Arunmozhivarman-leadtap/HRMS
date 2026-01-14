"use client"

import * as React from "react"
import {
    format,
    parseISO,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    addMonths,
    subMonths,
    isToday
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMyLeaveApplications, usePublicHolidays } from "../hooks/use-leaves"
import { cn } from "@/lib/utils"
import { LeaveApplicationStatus } from "@/types/leave"
import { Button } from "@/components/ui/button"

export function EmployeeLeaveCalendar() {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
    const { data: applications } = useMyLeaveApplications({ year: currentMonth.getFullYear(), limit: 500 })
    const { data: holidays } = usePublicHolidays(currentMonth.getFullYear())

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const goToToday = () => setCurrentMonth(new Date())

    // Map applications to days
    const leaveDays = React.useMemo(() => {
        const days: Record<string, { status: LeaveApplicationStatus; type: string }> = {}
        applications?.items?.forEach(app => {
            try {
                const start = parseISO(app.from_date)
                const end = app.to_date ? parseISO(app.to_date) : start
                const interval = eachDayOfInterval({ start, end })
                interval.forEach(day => {
                    days[format(day, 'yyyy-MM-dd')] = {
                        status: app.status,
                        type: app.leave_type_name || 'Leave'
                    }
                })
            } catch (e) {
                console.error("Error parsing leave dates", e)
            }
        })
        return days
    }, [applications])

    // Map holidays to days
    const holidayDays = React.useMemo(() => {
        const days: Record<string, string> = {}
        holidays?.forEach(holiday => {
            days[format(parseISO(holiday.holiday_date), 'yyyy-MM-dd')] = holiday.name
        })
        return days
    }, [holidays])

    // Calendar Grid Calculation
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-xl font-serif font-medium flex items-center gap-2">
                        <CalendarIcon className="size-5 text-primary" />
                        Leave Calendar
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
                            Today
                        </Button>
                        <div className="flex items-center border rounded-md bg-background">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-none border-r">
                                <ChevronLeft className="size-4" />
                            </Button>
                            <div className="px-3 py-1 text-sm font-medium min-w-[120px] text-center">
                                {format(currentMonth, 'MMMM yyyy')}
                            </div>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-none border-l">
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-0">
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                        {weekDays.map(day => (
                            <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            const dateKey = format(day, 'yyyy-MM-dd')
                            const leave = leaveDays[dateKey]
                            const holiday = holidayDays[dateKey]
                            const isCurrentMonth = isSameMonth(day, monthStart)

                            return (
                                <div
                                    key={dateKey}
                                    className={cn(
                                        "min-h-[100px] sm:min-h-[120px] p-2 border-r border-b relative transition-colors hover:bg-accent/5",
                                        (i + 1) % 7 === 0 && "border-r-0",
                                        !isCurrentMonth && "bg-muted/10 text-muted-foreground/50"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-medium inline-flex items-center justify-center size-7 rounded-full",
                                        isToday(day) && "bg-primary text-primary-foreground",
                                        !isToday(day) && isCurrentMonth && "text-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </span>

                                    <div className="mt-2 space-y-1">
                                        {holiday && (
                                            <div className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-[10px] sm:text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 truncate" title={holiday}>
                                                {holiday}
                                            </div>
                                        )}
                                        {leave && (
                                            <div className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium border truncate",
                                                leave.status === LeaveApplicationStatus.approved
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                            )} title={`${leave.type} (${leave.status})`}>
                                                {leave.type}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Legend & Summary */}
                <div className="mt-6 flex flex-wrap items-center gap-6 justify-center sm:justify-start px-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-3 rounded-full bg-emerald-500" />
                        <span>Approved Leave</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-3 rounded-full bg-amber-500" />
                        <span>Pending Approval</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-3 rounded bg-rose-500" />
                        <span>Public Holiday</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}