import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import { Employee, EmployeeListResponse } from "@/types/employee";

export function useEmployeeProfile(id?: number) {
    const url = id ? `/employees/${id}` : "/users/me";
    return useQuery({
        queryKey: ["employee", id || "me"],
        queryFn: () => fetcher<Employee>(url),
    });
}

export function useEmployees(params: {
    skip?: number;
    limit?: number;
    search?: string;
    department_id?: number;
    status?: string;
    archived?: boolean;
} = {}) {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.department_id) queryParams.append("department_id", params.department_id.toString());
    if (params.status) queryParams.append("status_filter", params.status);
    if (params.archived) queryParams.append("archived", "true");

    return useQuery({
        queryKey: ["employees", params],
        queryFn: () => fetcher<EmployeeListResponse>(`/employees/?${queryParams.toString()}`),
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) =>
            fetcher<Employee>(`/employees/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            queryClient.invalidateQueries({ queryKey: ["employee", data.id] });
            queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
        },
    });
}

export function useArchiveEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            fetcher<Employee>(`/employees/${id}/archive`, {
                method: "POST",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}

export function useRestoreEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            fetcher<Employee>(`/employees/${id}/restore`, {
                method: "POST",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
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

export function useUploadPhoto() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: number; file: File }) => {
            const formData = new FormData();
            formData.append("file", file);
            return fetcher<Employee>(`/employees/${id}/photo`, {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["employee", data.id] });
            queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
            queryClient.invalidateQueries({ queryKey: ["user", "me"] });
        },
    });
}
