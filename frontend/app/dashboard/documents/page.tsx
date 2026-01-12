import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Redirect based on role
  if (user.role === "employee" || user.role === "candidate") {
    redirect("/dashboard/documents/employee");
  } else if (user.role === "manager") {
    redirect("/dashboard/documents/manager");
  } else if (user.role === "hr_admin" || user.role === "super_admin") {
    redirect("/dashboard/documents/admin");
  } else {
    redirect("/dashboard/documents/employee");
  }
}
