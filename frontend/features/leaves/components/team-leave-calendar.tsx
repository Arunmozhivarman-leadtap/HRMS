"use client"

import { useState, useMemo, useRef } from "react"
import { useTeamLeaveApplications, usePublicHolidays, useTeamLeaveBalances } from "../hooks/use-leaves"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon, Info, Users } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, isToday, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip } from "@/components/ui/tooltip"

export const TeamLeaveCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const { data: applications, isLoading: isLoadingApps } = useTeamLeaveApplications()
    const { data: holidays, isLoading: isLoadingHolidays } = usePublicHolidays()
    const { data: teamBalances, isLoading: isLoadingBalances } = useTeamLeaveBalances()

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const teamMembers = useMemo(() => {
        if (!teamBalances) return []
        // Extract unique team members from balances
        return teamBalances.map(b => ({
            id: b.employee_id,
            name: b.employee?.full_name || `Employee ${b.employee_id}`
        })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    }, [teamBalances])

    const getLeaveStatus = (employeeId: number, date: Date) => {
        if (!applications) return null
        return applications.find(app => {
            if (app.employee_id !== employeeId) return false
            if (!['approved', 'pending'].includes(app.status)) return false

            const from = parseISO(app.from_date)
            const to = app.to_date ? parseISO(app.to_date) : from

            // Normalize dates to midnight for comparison
            const checkDate = new Date(date)
            checkDate.setHours(0, 0, 0, 0)
            const fromDate = new Date(from)
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(to)
            toDate.setHours(0, 0, 0, 0)

            return (checkDate >= fromDate && checkDate <= toDate)
        })
    }

    const getHoliday = (date: Date) => {
        if (!holidays) return null
        const dateStr = format(date, 'yyyy-MM-dd')
        return holidays.find(h => h.holiday_date === dateStr)
    }

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    // Scroll container ref for explicit scroll navigation
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
        }
    }

    if (isLoadingApps || isLoadingHolidays || isLoadingBalances) {
        return (
            <Card className="border-zinc-200 shadow-sm animate-pulse">
                <CardHeader className="h-24 bg-zinc-50/50" />
                <CardContent className="h-96" />
            </Card>
        )
    }

    return (
        <Card className="border-zinc-200 shadow-xl bg-white">
            <CardHeader className="p-6 border-b border-zinc-100 bg-zinc-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-serif font-bold text-foreground tracking-tight">
                                Team Availability
                            </CardTitle>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                Monthly Attendance Roadmap
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-zinc-200 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full hover:bg-zinc-100">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-bold px-4 min-w-[140px] text-center">
                            {format(currentMonth, "MMMM yyyy")}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full hover:bg-zinc-100">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6 items-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Approved Leave</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-amber-400 shadow-sm" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Pending Approval</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-zinc-200 shadow-sm" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Public Holiday</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-zinc-100 border border-zinc-200 shadow-sm" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Weekend</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 relative">
                {/* Left scroll button - smaller, edge-positioned */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={scrollLeft}
                    className="absolute left-[224px] top-1/2 -translate-y-1/2 z-50 h-8 w-8 rounded-full bg-white border border-zinc-200 shadow-md hover:bg-zinc-100 opacity-70 hover:opacity-100 transition-opacity"
                    title="Scroll left"
                >
                    <ChevronLeft className="h-4 w-4 text-zinc-600" />
                </Button>
                {/* Right scroll button - smaller, edge-positioned */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={scrollRight}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-50 h-8 w-8 rounded-full bg-white border border-zinc-200 shadow-md hover:bg-zinc-100 opacity-70 hover:opacity-100 transition-opacity"
                    title="Scroll right"
                >
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                </Button>
                <div ref={scrollContainerRef} className="overflow-x-scroll custom-scrollbar pb-4" style={{ scrollbarWidth: 'auto' }}>
                    <table className="min-w-max border-collapse table-fixed">
                        <thead className="sticky top-0 z-30">
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="sticky left-0 z-40 bg-zinc-50 p-4 text-left border-r border-b border-zinc-200 w-[220px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3 w-3 text-zinc-400" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Team Member</span>
                                    </div>
                                </th>
                                {days.map(day => {
                                    const holiday = getHoliday(day)
                                    const weekend = isWeekend(day)
                                    const current = isToday(day)
                                    return (
                                        <th
                                            key={day.toString()}
                                            className={cn(
                                                "p-2 text-center border-b border-r border-zinc-100 w-[60px] transition-colors bg-white",
                                                weekend && "bg-zinc-50/50",
                                                current && "bg-primary/5"
                                            )}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                    {format(day, "EEE")[0]}
                                                </span>
                                                <span className={cn(
                                                    "text-xs font-bold mt-1 h-6 w-6 flex items-center justify-center rounded-full transition-all",
                                                    isToday(day) ? "bg-primary text-white shadow-md scale-110" : "text-foreground"
                                                )}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map(member => (
                                <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="sticky left-0 z-10 bg-white p-4 border-r border-b border-zinc-100 shadow-[2px_0_5px_rgba(0,0,0,0.03)] w-[220px]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-primary border border-zinc-200">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-serif font-bold text-foreground truncate max-w-[140px]">
                                                {member.name}
                                            </span>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const leave = getLeaveStatus(member.id, day)
                                        const holiday = getHoliday(day)
                                        const weekend = isWeekend(day)
                                        const current = isToday(day)

                                        return (
                                            <td
                                                key={day.toString()}
                                                className={cn(
                                                    "p-1 border-r border-b border-zinc-100 transition-all duration-300 h-12 w-[60px]",
                                                    weekend && "bg-zinc-50/10",
                                                    current && "bg-primary/5 shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]"
                                                )}
                                            >
                                                <Tooltip
                                                    content={
                                                        (leave || holiday) ? (
                                                            <div className="space-y-1.5 min-w-[150px]">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                    {leave ? "Leave Details" : "Public Holiday"}
                                                                </p>
                                                                <p className="text-sm font-serif font-bold text-foreground">
                                                                    {leave ? leave.leave_type_name : holiday?.name}
                                                                </p>
                                                                {leave && (
                                                                    <>
                                                                        <p className="text-[11px] text-zinc-500 italic max-w-[200px]">
                                                                            "{leave.reason}"
                                                                        </p>
                                                                        <Badge variant="outline" className={cn(
                                                                            "mt-1 text-[9px] font-bold uppercase py-0 px-2",
                                                                            leave.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                                                        )}>
                                                                            {leave.status}
                                                                        </Badge>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : null
                                                    }
                                                >
                                                    <div className={cn(
                                                        "h-full rounded-md transition-all duration-300 transform cursor-default w-full flex items-center justify-center text-[10px] font-bold",
                                                        leave?.status === 'approved' && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105",
                                                        leave?.status === 'pending' && "bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/20 hover:scale-105",
                                                        holiday && "bg-zinc-200 text-zinc-600 border border-zinc-300 shadow-sm hover:scale-105",
                                                        !leave && !holiday && weekend && "bg-zinc-100/30 border border-zinc-100/50 border-dashed"
                                                    )}>
                                                        {leave ? (
                                                            (leave.leave_type_name || 'LV').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                                        ) : holiday ? (
                                                            "PH"
                                                        ) : null}
                                                    </div>
                                                </Tooltip>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Hint text for scroll discoverability */}
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground border-t border-zinc-100">
                    <ChevronLeft className="h-3 w-3" />
                    <span>Scroll or use arrows to view full month</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </CardContent>
            {teamMembers.length === 0 && (
                <div className="p-20 text-center bg-zinc-50/50">
                    <Info className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium text-muted-foreground">No team members found for this schedule.</p>
                </div>
            )}
        </Card>
    )
}
