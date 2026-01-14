import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

export function useCompanySettings() {
    return useQuery({
        queryKey: ["settings", "company"],
        queryFn: () => fetcher<any>("/settings/company"),
    });
}

export function useUpdateCompanySettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => fetcher<any>("/settings/company", {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
        },
    });
}

export function useMasterData(type: string, params: { skip?: number, limit?: number, search?: string } = {}) {
    return useQuery({
        queryKey: ["settings", "master", type, params],
        queryFn: () => {
            const queryParams = new URLSearchParams();
            if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
            if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
            if (params.search) queryParams.append("search", params.search);
            return fetcher<any>(`/settings/${type}?${queryParams.toString()}`);
        },
    });
}

export function useCreateMasterData(type: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => fetcher<any>(`/settings/${type}`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings", "master", type] });
        },
    });
}

export function useUploadCompanyLogo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            return fetcher<any>("/settings/company/logo", {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
        },
    });
}

export function useUploadLetterhead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            return fetcher<any>("/settings/company/letterhead", {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
        },
    });
}
