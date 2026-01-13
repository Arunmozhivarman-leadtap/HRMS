
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Users, Banknote } from "lucide-react"

interface LiabilityCardProps {
    data: {
        total_el_days: number
        total_lop_days: number
    }
}

export function LiabilityCard({ data }: LiabilityCardProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2 pt-5">
                    <CardTitle className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                        Total Earned Leave Liability
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-serif font-medium text-foreground">{data.total_el_days}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Days accumulated across all staff
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 pt-5">
                    <CardTitle className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                        Total Absenteeism (LOP)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-serif font-medium text-foreground">{data.total_lop_days}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Days of loss of pay recorded
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
