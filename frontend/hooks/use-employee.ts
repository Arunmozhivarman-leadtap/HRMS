import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

export interface Profile {
    bank_account_holder_name?: string;
    bank_name?: string;
    branch_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_type?: string;
}

export function useEmployeeProfile() {
    return useQuery({
        queryKey: ["employee", "me"],
        queryFn: () => fetcher<Profile>("/users/me"),
    });
}

export function useUpdateBankingInfo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Profile>) => fetcher<Profile>("/users/me/banking", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
        },
    });
}
