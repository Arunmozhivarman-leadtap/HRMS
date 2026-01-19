import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import { PortalAccessResponse, CandidateResponse, OnboardingTaskDetail } from "@/types/onboarding";

export function usePortalData(token: string) {
    return useQuery({
        queryKey: ["onboarding-portal", token],
        queryFn: () => fetcher<PortalAccessResponse>(`/onboarding/portal/${token}`),
        enabled: !!token,
    });
}

export function useCandidateTasks(candidateId: number) {
    return useQuery({
        queryKey: ["candidate-tasks", candidateId],
        queryFn: () => fetcher<OnboardingTaskDetail[]>(`/onboarding/candidates/${candidateId}/tasks`),
        enabled: !!candidateId,
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
            const formData = new FormData();
            formData.append("file", file);
            formData.append("task_id", taskId.toString());

            // Use the token-based endpoint
            return fetcher(`/onboarding/portal/${token}/upload`, {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding-portal", token] });
        },
    });
}

