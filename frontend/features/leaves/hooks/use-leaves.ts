import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getLeaveTypes,
    getMyLeaveBalances,
    applyLeave,
    updateLeave,
    cancelLeave,
    getMyLeaveApplications,
    getTeamLeaveApplications,
    getAllLeaveApplications,
    getPendingApprovals,
    approveLeave,
    rejectLeave,
    getPublicHolidays,
    getRestrictedHolidays,
    getTeamLeaveBalances,
    getAllLeaveBalances,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    getLeaveStats,
    requestLeaveCredit,
    getMyCreditRequests,
    getPendingCreditRequests,
    approveLeaveCredit,
    rejectLeaveCredit,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    getLeaveAnalytics,
    recallLeave
} from "../api";
import { LeaveApplicationCreate, LeaveType, LeaveCreditRequestCreate, PublicHoliday } from "@/types/leave";
import { useToast } from "@/hooks/use-toast";

export const useLeaveTypes = () => {
    return useQuery({
        queryKey: ["leave-types"],
        queryFn: getLeaveTypes,
    });
};

export const useMyLeaveBalances = (year?: number) => {
    return useQuery({
        queryKey: ["my-leave-balances", year],
        queryFn: () => getMyLeaveBalances(year),
    });
};

export const useMyLeaveApplications = (params: { skip?: number, limit?: number, year?: number } = {}) => {
    return useQuery({
        queryKey: ["my-leave-applications", params],
        queryFn: () => getMyLeaveApplications(params),
    });
};

export const usePendingApprovals = (params: { skip?: number, limit?: number, search?: string } = {}) => {
    return useQuery({
        queryKey: ["pending-approvals", params],
        queryFn: () => getPendingApprovals(params),
    });
};

export const usePublicHolidays = (year?: number) => {
    return useQuery({
        queryKey: ["public-holidays", year],
        queryFn: () => getPublicHolidays(year),
    });
};

export const useRestrictedHolidays = (year?: number) => {
    return useQuery<PublicHoliday[]>({
        queryKey: ['restricted-holidays', year],
        queryFn: () => getRestrictedHolidays(year),
    })
};

export const useTeamLeaveBalances = (params: { skip?: number, limit?: number, search?: string, year?: number } = {}) => {
    return useQuery({
        queryKey: ["team-leave-balances", params],
        queryFn: () => getTeamLeaveBalances(params),
    });
};

export const useAllLeaveBalances = (params: { skip?: number, limit?: number, search?: string, year?: number } = {}) => {
    return useQuery({
        queryKey: ["all-leave-balances", params],
        queryFn: () => getAllLeaveBalances(params),
    });
};

export const useTeamLeaveApplications = (params: { skip?: number, limit?: number, search?: string, year?: number } = {}) => {
    return useQuery({
        queryKey: ["team-leave-applications", params],
        queryFn: () => getTeamLeaveApplications(params),
    });
};

export const useAllLeaveApplications = (params: { skip?: number, limit?: number, search?: string, year?: number } = {}) => {
    return useQuery({
        queryKey: ["all-leave-applications", params],
        queryFn: () => getAllLeaveApplications(params),
    });
};

export const useCreateLeaveType = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<LeaveType>) => createLeaveType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-types"] });
            toast({ title: "Success", description: "Leave type created successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message || "Failed to create leave type.", variant: "destructive" });
        },
    });
};

export const useUpdateLeaveType = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<LeaveType> }) => updateLeaveType(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-types"] });
            toast({ title: "Success", description: "Leave type updated successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message || "Failed to update leave type.", variant: "destructive" });
        },
    });
};

export const useDeleteLeaveType = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => deleteLeaveType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-types"] });
            toast({ title: "Success", description: "Leave type deleted successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message || "Failed to delete leave type.", variant: "destructive" });
        },
    });
};

export const useLeaveStats = (year?: number) => {
    return useQuery({
        queryKey: ["leave-stats", year],
        queryFn: () => getLeaveStats(year),
    });
};

export const useLeaveAnalytics = (year?: number) => {
    return useQuery({
        queryKey: ["leave-analytics", year],
        queryFn: () => getLeaveAnalytics(year),
    });
};

export const useApplyLeave = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ data, attachment }: { data: LeaveApplicationCreate, attachment?: File }) => applyLeave(data, attachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-leave-applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-leave-balances"] });
            toast({
                title: "Application Submitted",
                description: "Your leave application has been submitted successfully.",
                variant: "success",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit leave application.",
                variant: "destructive",
            });
        },
    });
};

export const useUpdateLeave = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data, attachment, clearAttachment }: { id: number, data: LeaveApplicationCreate, attachment?: File, clearAttachment?: boolean }) =>
            updateLeave(id, data, attachment, clearAttachment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-leave-applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-leave-balances"] });
            toast({
                title: "Application Updated",
                description: "Your leave application has been updated successfully.",
                variant: "success",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update leave application.",
                variant: "destructive",
            });
        },
    });
};

export const useCancelLeave = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => cancelLeave(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-leave-applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-leave-balances"] });
            toast({
                title: "Application Cancelled",
                description: "Your leave application has been cancelled/deleted.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to cancel leave application.",
                variant: "destructive",
            });
        },
    });
};

export const useApproveLeave = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, note }: { id: number, note?: string }) => approveLeave(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
            queryClient.invalidateQueries({ queryKey: ["my-leave-applications"] });
            toast({
                title: "Approved",
                description: "Leave application approved successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to approve leave.",
                variant: "destructive",
            });
        },
    });
};

export const useRejectLeave = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, note }: { id: number, note?: string }) => rejectLeave(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
            queryClient.invalidateQueries({ queryKey: ["my-leave-applications"] });
            toast({
                title: "Rejected",
                description: "Leave application rejected.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to reject leave.",
                variant: "destructive",
            });
        },
    });
};

// Credit Hooks

export const useRequestLeaveCredit = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: LeaveCreditRequestCreate) => requestLeaveCredit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-credit-requests"] });
            toast({
                title: "Credit Request Submitted",
                description: "Your request for leave credit has been submitted.",
                variant: "success",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit request.",
                variant: "destructive",
            });
        },
    });
};

export const useMyCreditRequests = (params: { skip?: number, limit?: number } = {}) => {
    return useQuery({
        queryKey: ["my-credit-requests", params],
        queryFn: () => getMyCreditRequests(params),
    });
};

export const usePendingCreditRequests = (params: { skip?: number, limit?: number, search?: string } = {}) => {
    return useQuery({
        queryKey: ["pending-credit-requests", params],
        queryFn: () => getPendingCreditRequests(params),
    });
};

export const useApproveLeaveCredit = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => approveLeaveCredit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-credit-requests"] });
            queryClient.invalidateQueries({ queryKey: ["team-leave-balances"] });
            toast({
                title: "Approved",
                description: "Leave credit approved successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to approve credit.",
                variant: "destructive",
            });
        },
    });
};

export const useRejectLeaveCredit = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => rejectLeaveCredit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-credit-requests"] });
            toast({
                title: "Rejected",
                description: "Leave credit rejected.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to reject credit.",
                variant: "destructive",
            });
        },
    });
};

export const useCreateHoliday = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<PublicHoliday>) => createHoliday(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["public-holidays"] });
            toast({ title: "Success", description: "Holiday created successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message || "Failed to create holiday.", variant: "destructive" });
        },
    });
};

export const useUpdateHoliday = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<PublicHoliday> }) => updateHoliday(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["public-holidays"] });
            toast({ title: "Success", description: "Holiday updated successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message || "Failed to update holiday.", variant: "destructive" });
        },
    });
};

export const useDeleteHoliday = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => deleteHoliday(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["public-holidays"] });
            toast({ title: "Success", description: "Holiday deleted successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message || "Failed to delete holiday.", variant: "destructive" });
        },
    });
};

export const useRecallLeave = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, recallDate, reason }: { id: number, recallDate: string, reason: string }) =>
            recallLeave(id, recallDate, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-leave-applications"] });
            queryClient.invalidateQueries({ queryKey: ["team-leave-applications"] });
            queryClient.invalidateQueries({ queryKey: ["all-leave-applications"] });
            queryClient.invalidateQueries({ queryKey: ["my-leave-balances"] });
            queryClient.invalidateQueries({ queryKey: ["team-leave-balances"] });
            queryClient.invalidateQueries({ queryKey: ["all-leave-balances"] });
            toast({
                title: "Employee Recalled",
                description: "The leave has been updated and unused days credited back.",
                variant: "success",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Recall Failed",
                description: error.message || "Failed to recall employee from leave.",
                variant: "destructive",
            });
        },
    });
};

