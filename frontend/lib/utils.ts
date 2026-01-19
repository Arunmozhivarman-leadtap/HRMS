import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPhotoUrl(photoPath?: string | null) {
  if (!photoPath) return undefined;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");
  return `${baseUrl}/uploads/${photoPath}`;
}

export function getFileUrl (path?: string)  {
        if (!path) return "#"
        // Remove "uploads/" prefix if path already has it (safety check)
        const cleanPath = path.startsWith("uploads/") ? path.replace("uploads/", "") : path;
        return `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
                .replace(/\/api\/?$/, "")
            }/uploads/${cleanPath}`;
    }

export function formatErrorMessage(error: any): string {
  if (typeof error === "string") return error;

  const detail = error?.detail || error?.message;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(", ");
  }

  if (typeof detail === "object" && detail !== null) {
    return JSON.stringify(detail);
  }

  return "An unexpected error occurred";
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
