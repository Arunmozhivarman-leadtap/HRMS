import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import { PaginatedResponse } from "@/types/api";

export interface MasterData {
    id: number;
    name: string;
}

export function useDepartments() {
    return useQuery({
        queryKey: ["departments"],
        queryFn: () => fetcher<PaginatedResponse<MasterData>>("/settings/departments"),
    });
}

export function useDesignations() {
    return useQuery({
        queryKey: ["designations"],
        queryFn: () => fetcher<PaginatedResponse<MasterData>>("/settings/designations"),
    });
}

export function useEmploymentTypes() {
    return useQuery({
        queryKey: ["employment-types"],
        queryFn: () => fetcher<PaginatedResponse<MasterData>>("/settings/employment-types"),
    });
}

