import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function RecruitmentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Redirect based on role
  if (user.role === "super_admin" || user.role === "hr_admin") {
    redirect("/dashboard/recruitment/admin");
  } else {
    // Other roles shouldn't have access to recruitment dashboard logic
    // They might be candidates (handled via public /onboarding link) or employees
    // For now, redirect them to their home or show 403.
    // Employees don't have a recruitment view.
    redirect("/dashboard"); 
  }
}
