const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(public status: number, public message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetcher<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${url}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    credentials: "include", // Essential for sending/receiving cookies
  });

  // If unauthorized, the browser/backend handles the cookie-based refresh flow
  // or redirect to login.
  if (response.status === 401 && typeof window !== "undefined") {
    // Optional: Trigger a client-side redirect if the session is truly dead
    // window.location.href = "/";
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.detail || "An unexpected error occurred");
  }
  return response.json();
}

export async function logout() {
  try {
    await fetcher("/auth/logout", { method: "POST" });
  } finally {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
}
