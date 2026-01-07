import { cn } from "../lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn("mx-auto max-w-[1200px] px-md", className)}>
      {children}
    </div>
  );
}
