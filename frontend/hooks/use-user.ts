import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

export interface User {
    id: number;
    email: string;
    username: string;
    role: "super_admin" | "hr_admin" | "manager" | "employee" | "candidate";
    employee_id?: number;
}

export function useUser() {
    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user", "me"],
        queryFn: () => fetcher<User>("/auth/me"),
        retry: false,
    });

    return { user, isLoading, error };
}
