import { getCurrentUser } from "@/lib/api-server";
import { LeavesNav } from "@/features/leaves/components/leaves-nav";

export default async function LeavesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'hr_admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="flex-1 relative pb-20">
      {/* Background Accents (Subtle geometric grid) */}
      <div className="absolute top-[-20px] right-[-40px] -z-10 opacity-20 pointer-events-none select-none">
        <div className="grid grid-cols-4 grid-rows-4 gap-1">
          <div className="w-16 h-16 bg-red-100/50 rounded-sm"></div>
          <div className="w-16 h-16 bg-orange-100/50 rounded-sm"></div>
          <div className="w-16 h-16 bg-transparent"></div>
          <div className="w-16 h-16 bg-red-50/50 rounded-sm"></div>

          <div className="w-16 h-16 bg-transparent"></div>
          <div className="w-16 h-16 bg-red-100/30 rounded-sm"></div>
          <div className="w-16 h-16 bg-orange-50/50 rounded-sm"></div>
          <div className="w-16 h-16 bg-transparent"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">
            Leave Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Manage your leaves, approvals, and team availability.
          </p>
        </div>

        <LeavesNav isManager={isManager} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
      </div>
      {children}
    </div>
  );
}