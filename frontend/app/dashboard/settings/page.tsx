import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Only Admin and HR Admin can access settings
  if (user.role === "super_admin" || user.role === "hr_admin") {
    redirect("/dashboard/settings/admin/company");
  } else {
    // Managers and Employees redirected back to dashboard
    redirect("/dashboard");
  }
}
