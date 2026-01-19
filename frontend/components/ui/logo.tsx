import { cn } from "@/lib/utils";
import { useCompanySettings } from "@/hooks/use-settings";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  const { data: settings } = useCompanySettings();

  const logoUrl = settings?.logo_url
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/uploads/${settings.logo_url}`
    : null;

  return (
    <div className={cn("flex items-center gap-xs", className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={settings?.company_name || "Company Logo"}
          width={100}
          height={100}
          className="h-auto w-[60px] object-contain"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-foreground"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="currentColor"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Re-writing correctly based on previous view_file */}
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="text-xl font-bold tracking-tight text-foreground">
        {settings?.company_name ? settings.company_name.split(' ')[0] : "HRMS"}
      </span>
    </div>
  );
}