import { eachDayOfInterval, isSaturday, isSunday, parseISO, format } from "date-fns"
import { PublicHoliday } from "@/types/leave"

export function calculateWorkingDays(
    startDate: Date | string,
    endDate: Date | string | null,
    durationType: string,
    holidays: PublicHoliday[] = []
): number {
    if (durationType === "Half Day") return 0.5
    
    const start = typeof startDate === "string" ? parseISO(startDate) : startDate
    const end = endDate ? (typeof endDate === "string" ? parseISO(endDate) : endDate) : start

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

    const holidayDates = new Set(holidays.map(h => format(parseISO(h.holiday_date), 'yyyy-MM-dd')))
    
    const days = eachDayOfInterval({ start, end })
    let workingDays = 0

    days.forEach(day => {
        const isWeekend = isSaturday(day) || isSunday(day)
        const isHoliday = holidayDates.has(format(day, 'yyyy-MM-dd'))
        
        if (!isWeekend && !isHoliday) {
            workingDays++
        }
    })

    return workingDays
}
