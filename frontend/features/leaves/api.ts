import { fetcher } from "@/lib/api";
import { PaginatedResponse } from "@/types/api";
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

export const getMyLeaveApplications = async (params: { skip?: number, limit?: number, year?: number } = {}): Promise<PaginatedResponse<LeaveApplication>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.year) queryParams.append("year", params.year.toString());
    return fetcher<PaginatedResponse<LeaveApplication>>(`/leaves/applications/my?${queryParams.toString()}`);
};

export const getPendingApprovals = async (params: { skip?: number, limit?: number, search?: string } = {}): Promise<PaginatedResponse<LeaveApplication>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    return fetcher<PaginatedResponse<LeaveApplication>>(`/leaves/approvals/pending?${queryParams.toString()}`);
};

export const approveLeave = async (id: number, note?: string): Promise<LeaveApplication> => {
    return fetcher<LeaveApplication>(`/leaves/approve/${id}`, {
        method: "POST",
        body: JSON.stringify({ comments: note }),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const rejectLeave = async (id: number, note?: string): Promise<LeaveApplication> => {
    return fetcher<LeaveApplication>(`/leaves/reject/${id}`, {
        method: "POST",
        body: JSON.stringify({ comments: note }),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const getTeamCalendar = async (fromDate: string, toDate: string): Promise<LeaveApplication[]> => {
    return fetcher<LeaveApplication[]>(`/leaves/calendar/team?from_date=${fromDate}&to_date=${toDate}`);
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

export const getRestrictedHolidays = async (year?: number): Promise<PublicHoliday[]> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<PublicHoliday[]>(`/leaves/holidays/restricted${query}`);
};

export const getTeamLeaveBalances = async (params: { skip?: number, limit?: number, search?: string, year?: number } = {}): Promise<PaginatedResponse<LeaveBalance>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.year) queryParams.append("year", params.year.toString());
    return fetcher<PaginatedResponse<LeaveBalance>>(`/leaves/balances/team?${queryParams.toString()}`);
};


export const getTeamLeaveApplications = async (params: { skip?: number, limit?: number, search?: string, year?: number } = {}): Promise<PaginatedResponse<LeaveApplication>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.year) queryParams.append("year", params.year.toString());
    return fetcher<PaginatedResponse<LeaveApplication>>(`/leaves/applications/team?${queryParams.toString()}`);
};

export const getAllLeaveApplications = async (params: { skip?: number, limit?: number, search?: string, year?: number } = {}): Promise<PaginatedResponse<LeaveApplication>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.year) queryParams.append("year", params.year.toString());
    return fetcher<PaginatedResponse<LeaveApplication>>(`/leaves/applications/all?${queryParams.toString()}`);
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

export const getLeaveAnalytics = async (year?: number): Promise<{
    trends: { month: number, days: number }[];
    department_utilization: { department: string, days: number }[];
    type_utilization: { type: string, days: number }[];
    liability: { total_el_days: number, total_lop_days: number };
    top_absentees: { name: string, days: number }[];
}> => {
    const query = year ? `?year=${year}` : "";
    return fetcher<{
        trends: { month: number, days: number }[];
        department_utilization: { department: string, days: number }[];
        type_utilization: { type: string, days: number }[];
        liability: { total_el_days: number, total_lop_days: number };
        top_absentees: { name: string, days: number }[];
    }>(`/leaves/analytics${query}`);
};

// Credit Requests
export const requestLeaveCredit = async (data: LeaveCreditRequestCreate): Promise<LeaveCreditRequest> => {
    return fetcher<LeaveCreditRequest>("/leaves/credit", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const getMyCreditRequests = async (params: { skip?: number, limit?: number } = {}): Promise<PaginatedResponse<LeaveCreditRequest>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    return fetcher<PaginatedResponse<LeaveCreditRequest>>(`/leaves/credit/my?${queryParams.toString()}`);
};

export const getPendingCreditRequests = async (params: { skip?: number, limit?: number, search?: string } = {}): Promise<PaginatedResponse<LeaveCreditRequest>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    return fetcher<PaginatedResponse<LeaveCreditRequest>>(`/leaves/credit/pending?${queryParams.toString()}`);
};

export const approveLeaveCredit = async (id: number): Promise<LeaveCreditRequest> => {
    return fetcher<LeaveCreditRequest>(`/leaves/credit/${id}/approve`, { method: "POST" });
};

export const rejectLeaveCredit = async (id: number): Promise<LeaveCreditRequest> => {
    return fetcher<LeaveCreditRequest>(`/leaves/credit/${id}/reject`, { method: "POST" });
};

// Holidays
export const createHoliday = async (data: Partial<PublicHoliday>): Promise<PublicHoliday> => {
    return fetcher<PublicHoliday>("/leaves/holidays", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateHoliday = async (id: number, data: Partial<PublicHoliday>): Promise<PublicHoliday> => {
    return fetcher<PublicHoliday>(`/leaves/holidays/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteHoliday = async (id: number): Promise<void> => {
    return fetcher<void>(`/leaves/holidays/${id}`, {
        method: "DELETE",
    });
};

export const recallLeave = async (id: number, recallDate: string, reason: string): Promise<LeaveApplication> => {
    return fetcher<LeaveApplication>(`/leaves/recall/${id}`, {
        method: "POST",
        body: JSON.stringify({ recall_date: recallDate, reason }),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const getAllLeaveBalances = async (params: { skip?: number, limit?: number, search?: string, year?: number } = {}): Promise<PaginatedResponse<LeaveBalance>> => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.year) queryParams.append("year", params.year.toString());
    return fetcher<PaginatedResponse<LeaveBalance>>(`/leaves/balances/all?${queryParams.toString()}`);
};
