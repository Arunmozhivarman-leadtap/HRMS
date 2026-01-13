import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Redirect based on role
  if (user.role === "super_admin" || user.role === "hr_admin") {
    redirect("/dashboard/employees/admin");
  } else if (user.role === "manager") {
    redirect("/dashboard/employees/manager");
  } else {
    redirect("/dashboard/employees/me");
  }
}
