import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, PartyPopper } from "lucide-react";

export function CelebrationsWidget() {
  const celebrations = [
    {
      id: 1,
      name: "Rahul Sharma",
      type: "birthday",
      date: "Today",
      avatar: "/avatars/01.png",
      initials: "RS",
    },
    {
      id: 2,
      name: "Priya Gupta",
      type: "anniversary",
      years: 3,
      date: "Today",
      avatar: "/avatars/02.png",
      initials: "PG",
    },
    {
      id: 3,
      name: "Amit Kumar",
      type: "birthday",
      date: "5 Jan",
      avatar: "/avatars/03.png",
      initials: "AK",
    },
    {
        id: 4,
        name: "Sarah Jenkins",
        type: "anniversary",
        years: 1,
        date: "7 Jan",
        avatar: "/avatars/04.png",
        initials: "SJ",
      },
  ];

  return (
    <Card className="bg-background border shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/40">
        <CardTitle className="text-xl font-serif font-medium text-foreground">Celebrations</CardTitle>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">This Week</span>
      </CardHeader>
      <CardContent className="pt-6 flex-1 overflow-auto">
        <div className="space-y-1">
          {celebrations.map((item) => (
            <div key={item.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={item.avatar} alt={item.name} />
                    <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">{item.initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-border">
                    {item.type === "birthday" ? (
                        <Cake className="w-3 h-3 text-red-500" />
                    ) : (
                        <PartyPopper className="w-3 h-3 text-orange-500" />
                    )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                  <span className={item.date === "Today" ? "text-green-600 font-medium" : ""}>{item.date}</span>
                  <span className="w-0.5 h-0.5 bg-muted-foreground rounded-full" />
                  {item.type === "birthday" ? (
                    <span>Birthday</span>
                  ) : (
                    <span>{item.years} Year Work Anniversary</span>
                  )}
                </p>
              </div>
              
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20">
                Wish
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}