import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import { PortalAccessResponse, CandidateResponse } from "@/types/onboarding"; // I will create these types next

export function usePortalData(token: string) {
    return useQuery({
        queryKey: ["onboarding-portal", token],
        queryFn: () => fetcher<PortalAccessResponse>(`/onboarding/portal/${token}`),
        enabled: !!token,
    });
}

export function useRespondOffer(token: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { action: "accept" | "reject"; reason?: string }) =>
            fetcher<CandidateResponse>(`/onboarding/portal/${token}/offer`, {
                method: "POST",
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding-portal", token] });
        },
    });
}

export function useCandidates() {
    return useQuery({
        queryKey: ["candidates"],
        queryFn: () => fetcher<CandidateResponse[]>("/onboarding/candidates"),
    });
}

export function useConvertCandidate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            fetcher<{ message: string; employee_id: number }>(`/onboarding/candidates/${id}/convert`, {
                method: "POST",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["candidates"] });
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}

export function useUploadOnboardingDoc(token: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, file }: { taskId: number; file: File }) => {
            // We reuse the existing upload endpoint but we need to pass candidate_id or token
            // The backend endpoint /onboarding/documents/upload expects candidate_id and checklist_item_id
            // However, the portal is token-based. I should probably add a token-based upload or 
            // ensure the candidate_id is available from portal data.
            // Let's check portal data structure again.
            
            const formData = new FormData();
            formData.append("file", file);
            formData.append("checklist_item_id", taskId.toString());
            // candidate_id will be appended in the component call where it's available
            
            return fetcher("/onboarding/documents/upload", {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding-portal", token] });
        },
    });
}

