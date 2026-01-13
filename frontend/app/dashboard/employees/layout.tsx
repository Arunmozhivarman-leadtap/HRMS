import { getCurrentUser } from "@/lib/api-server";
import { EmployeesNav } from "@/components/employees/employees-nav";

export default async function EmployeesLayout({
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
          <div className="w-16 h-16 bg-blue-100/50 rounded-sm"></div>
          <div className="w-16 h-16 bg-indigo-100/50 rounded-sm"></div>
          <div className="w-16 h-16 bg-transparent"></div>
          <div className="w-16 h-16 bg-blue-50/50 rounded-sm"></div>

          <div className="w-16 h-16 bg-transparent"></div>
          <div className="w-16 h-16 bg-blue-100/30 rounded-sm"></div>
          <div className="w-16 h-16 bg-indigo-50/50 rounded-sm"></div>
          <div className="w-16 h-16 bg-transparent"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">
            Employee Directory
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Manage your profile, team members, and organizational directory.
          </p>
        </div>

        <EmployeesNav isManager={isManager} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
      </div>

      <div className="animate-in fade-in duration-700">
        {children}
      </div>

      <footer className="mt-20 pt-8 border-t border-muted text-center text-[10px] uppercase tracking-widest text-muted-foreground/60 space-y-1 font-bold">
        <p>© 2026 LeadTap Digi Solutions. Data protection compliant.</p>
        <p>Audit logging enabled for all personal data operations.</p>
      </footer>
    </div>
  );
}
