import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentVerificationUpdate, Document } from "@/types/document";
import { fetcher } from "@/lib/api";

export function useVerifyDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: DocumentVerificationUpdate }) => {
            return fetcher<Document>(`/documents/${id}/verify`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            // Invalidate document lists and stats to refresh UI
            queryClient.invalidateQueries({ queryKey: ["admin-document-stats"] });
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["team-document-stats"] }); // For managers
            queryClient.invalidateQueries({ queryKey: ["team-documents"] });
        },
    });
}
