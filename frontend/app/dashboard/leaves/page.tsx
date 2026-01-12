import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function LeavesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Redirect based on role
  if (user.role === "employee" || user.role === "candidate") {
    redirect("/dashboard/leaves/employee");
  } else if (user.role === "manager") {
    redirect("/dashboard/leaves/manager");
  } else if (user.role === "hr_admin" || user.role === "super_admin") {
    redirect("/dashboard/leaves/admin");
  } else {
    // Fallback for unknown roles
    redirect("/dashboard/leaves/employee");
  }
}
