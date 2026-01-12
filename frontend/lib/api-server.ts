import { cookies } from "next/headers";
import { User } from "@/hooks/use-user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("access_token") || cookieStore.get("session_id"); 
  // Note: Adjust cookie name based on what the backend sets. 
  // Usually FastAPI OAuth2 sets 'access_token' or similar if using cookies, 
  // or it might expect the Authorization header if the client sends it.
  // However, the `fetcher` in api.ts uses credentials: "include", which implies cookies.
  // Let's assume the cookie name is standard or we forward all.

  // Safest bet: Forward all cookies string.
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookieString,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Failed to fetch current user", e);
    return null;
  }
}
