import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

export interface MasterData {
    id: number;
    name: string;
}

export function useDepartments() {
    return useQuery({
        queryKey: ["departments"],
        queryFn: () => fetcher<MasterData[]>("/settings/departments"),
    });
}

export function useDesignations() {
    return useQuery({
        queryKey: ["designations"],
        queryFn: () => fetcher<MasterData[]>("/settings/designations"),
    });
}

export function useEmploymentTypes() {
    return useQuery({
        queryKey: ["employment-types"],
        queryFn: () => fetcher<MasterData[]>("/settings/employment-types"),
    });
}

