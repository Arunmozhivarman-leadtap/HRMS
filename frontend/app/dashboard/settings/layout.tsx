import { getCurrentUser } from "@/lib/api-server";
import { SettingsNav } from "@/components/settings/settings-nav";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'super_admin' && user.role !== 'hr_admin')) {
    redirect("/dashboard");
  }

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
            System Settings
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Configure your organizational structure and business preferences.
          </p>
        </div>

        <SettingsNav />
      </div>

      <div className="animate-in fade-in duration-700">
        {children}
      </div>

      <footer className="mt-20 pt-8 border-t border-muted text-center text-[10px] uppercase tracking-widest text-muted-foreground/60 space-y-1 font-bold">
        <p>© 2026 LeadTap Digi Solutions. Data protection compliant.</p>
        <p>Administration Panel. All configuration changes are logged for security auditing.</p>
      </footer>
    </div>
  );
}
