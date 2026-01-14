"use client"

import { usePublicHolidays } from "../hooks/use-leaves"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"

export function PublicHolidayList() {
    const currentYear = new Date().getFullYear()
    const { data: holidays, isLoading } = usePublicHolidays(currentYear)

    if (isLoading) {
        return <HolidaySkeleton />
    }

    // Filter upcoming holidays
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingHolidays = holidays?.filter(h => new Date(h.holiday_date) >= today)
        .sort((a, b) => new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()) || []

    return (
        <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
            <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-serif font-medium text-foreground">Public Holidays</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Upcoming office holidays for {currentYear}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
                <div className="space-y-6">
                    {upcomingHolidays.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No upcoming holidays.</p>
                    ) : (
                        upcomingHolidays.slice(0, 5).map((holiday) => {
                            const date = new Date(holiday.holiday_date)
                            const day = date.getDate()
                            const month = date.toLocaleString('default', { month: 'short' })
                            const weekday = date.toLocaleString('default', { weekday: 'long' })

                            return (
                                <div key={holiday.id} className="flex items-center gap-4 group">
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-white border border-border/60 shadow-sm rounded-md transition-transform group-hover:scale-105">
                                        <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">{month}</span>
                                        <span className="text-lg font-serif font-bold text-foreground leading-none">{day}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{holiday.name}</p>
                                        <p className="text-xs text-muted-foreground">{weekday}</p>
                                    </div>
                                    {holiday.is_restricted && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                            Restricted
                                        </span>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function HolidaySkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-4 border-b border-border/40">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[200px] mt-2" />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-3 w-[80px]" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
