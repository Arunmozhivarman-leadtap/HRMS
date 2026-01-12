import { fetcher } from "@/lib/api";
import {
    LeaveType,
    LeaveBalance,
    LeaveApplication,
    LeaveApplicationCreate,
    PublicHoliday,
    LeaveCreditRequest,
    LeaveCreditRequestCreate
} from "@/types/leave";

export const getLeaveTypes = async (): Promise<LeaveType[]> => {
    return fetcher<LeaveType[]>("/leaves/types");
};

export const getMyLeaveBalances = async (year?: number): Promise<LeaveBalance[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<LeaveBalance[]>(`/leaves/balances/my${query}`);
};

export const applyLeave = async (data: LeaveApplicationCreate, attachment?: File): Promise<LeaveApplication> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            // Handle dates
            if (value instanceof Date) {
                formData.append(key, value.toISOString().split('T')[0]);
            } else {
                formData.append(key, value.toString());
            }
        }
    });

    if (attachment) {
        formData.append("attachment", attachment);
    }

    return fetcher<LeaveApplication>("/leaves/apply", {
        method: "POST",
        body: formData,
    });
};

export const getMyLeaveApplications = async (year?: number): Promise<LeaveApplication[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<LeaveApplication[]>(`/leaves/applications/my${query}`);
};

export const getPendingApprovals = async (): Promise<LeaveApplication[]> => {
    return fetcher<LeaveApplication[]>("/leaves/approvals/pending");
};

export const approveLeave = async (id: number, note?: string): Promise<LeaveApplication> => {
    const query = note ? `?note=${encodeURIComponent(note)}` : "";
    return fetcher<LeaveApplication>(`/leaves/approve/${id}${query}`, {
        method: "POST",
    });
};

export const rejectLeave = async (id: number, note?: string): Promise<LeaveApplication> => {
    const query = note ? `?note=${encodeURIComponent(note)}` : "";
    return fetcher<LeaveApplication>(`/leaves/reject/${id}${query}`, {
        method: "POST",
    });
};

export const updateLeave = async (id: number, data: LeaveApplicationCreate, attachment?: File, clearAttachment?: boolean): Promise<LeaveApplication> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof Date) {
                formData.append(key, value.toISOString().split('T')[0]);
            } else {
                formData.append(key, value.toString());
            }
        }
    });

    if (attachment) {
        formData.append("attachment", attachment);
    }

    if (clearAttachment) {
        formData.append("clear_attachment", "true");
    }

    return fetcher<LeaveApplication>(`/leaves/update/${id}`, {
        method: "PUT",
        body: formData,
    });
};

export const cancelLeave = async (id: number): Promise<void> => {
    return fetcher<void>(`/leaves/cancel/${id}`, {
        method: "DELETE",
    });
};

export const getPublicHolidays = async (year?: number): Promise<PublicHoliday[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<PublicHoliday[]>(`/leaves/holidays${query}`);
};

export const getTeamLeaveBalances = async (year?: number): Promise<LeaveBalance[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<LeaveBalance[]>(`/leaves/balances/team${query}`);
};

export const getAllLeaveBalances = async (year?: number): Promise<LeaveBalance[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<LeaveBalance[]>(`/leaves/balances/all${query}`);
};

export const getTeamLeaveApplications = async (year?: number): Promise<LeaveApplication[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<LeaveApplication[]>(`/leaves/applications/team${query}`);
};

export const getAllLeaveApplications = async (year?: number): Promise<LeaveApplication[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<LeaveApplication[]>(`/leaves/applications/all${query}`);
};

export const createLeaveType = async (data: Partial<LeaveType>): Promise<LeaveType> => {
    return fetcher<LeaveType>("/leaves/types", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateLeaveType = async (id: number, data: Partial<LeaveType>): Promise<LeaveType> => {
    return fetcher<LeaveType>(`/leaves/types/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteLeaveType = async (id: number): Promise<void> => {
    return fetcher<void>(`/leaves/types/${id}`, {
        method: "DELETE",
    });
};

export const getLeaveStats = async (year?: number): Promise<{
    total_employees: number;
    pending_applications: number;
    taken_by_type: Record<string, number>;
}> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<{
        total_employees: number;
        pending_applications: number;
        taken_by_type: Record<string, number>;
    }>(`/leaves/stats${query}`);
};

// Credit Requests
export const requestLeaveCredit = async (data: LeaveCreditRequestCreate): Promise<LeaveCreditRequest> => {
    return fetcher<LeaveCreditRequest>("/leaves/credit", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const getMyCreditRequests = async (): Promise<LeaveCreditRequest[]> => {
    return fetcher<LeaveCreditRequest[]>("/leaves/credit/my");
};

export const getPendingCreditRequests = async (): Promise<LeaveCreditRequest[]> => {
    return fetcher<LeaveCreditRequest[]>("/leaves/credit/pending");
};

export const approveLeaveCredit = async (id: number): Promise<LeaveCreditRequest> => {
    return fetcher<LeaveCreditRequest>(`/leaves/credit/${id}/approve`, { method: "POST" });
};

export const rejectLeaveCredit = async (id: number): Promise<LeaveCreditRequest> => {
    return fetcher<LeaveCreditRequest>(`/leaves/credit/${id}/reject`, { method: "POST" });
};
