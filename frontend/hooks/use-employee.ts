import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

import { Employee } from "@/types/employee";

export function useEmployeeProfile() {
    return useQuery({
        queryKey: ["employee", "me"],
        queryFn: () => fetcher<Employee>("/users/me"),
    });
}

export function useUpdateBankingInfo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Employee>) => fetcher<Employee>("/users/me/banking", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
        },
    });
}
