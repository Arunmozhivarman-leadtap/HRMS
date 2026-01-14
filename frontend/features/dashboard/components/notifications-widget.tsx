import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";

const notifications = [
    { id: 1, title: "Policy Update", message: "The new attendance policy for 2026 has been published.", time: "2h ago", type: "info" },
    { id: 2, title: "Leave Approved", message: "Your casual leave request for Feb 12 has been approved.", time: "5h ago", type: "success" },
    { id: 3, title: "Document Required", message: "Please upload your pending tax declarations by tomorrow.", time: "1d ago", type: "warning" },
    { id: 4, title: "Upcoming Holiday", message: "Office will remain closed on Jan 26 for Republic Day.", time: "2d ago", type: "info" },
    { id: 5, title: "System Maintenance", message: "The HRMS portel will be down for maintenance on Saturday midnight.", time: "3d ago", type: "system" },
];

export function NotificationsWidget() {
    return (
        <Card className="bg-background border shadow-sm">
            <CardHeader className="pb-4 pt-4 border-b border-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Recent Notifications
                </CardTitle>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Last 5</span>
            </CardHeader>
            <CardContent className="pt-4 px-0">
                <div className="divide-y divide-border/40">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{notif.title}</h4>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {notif.time}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {notif.message}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
