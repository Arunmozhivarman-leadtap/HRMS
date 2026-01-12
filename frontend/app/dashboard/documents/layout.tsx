import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex-1 relative pb-20">
      <div className="flex flex-col gap-3 mb-12 relative">
        <h2 className="text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">
          Document Management
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
          Securely manage and verify employee documentation.
        </p>
      </div>
      {children}
    </div>
  );
}
