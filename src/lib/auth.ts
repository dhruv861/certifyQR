// Simple basic authentication for admin pages
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "iadc2025", // Change this to a secure password
};

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const auth = localStorage.getItem("admin_auth");
  if (!auth) return false;

  try {
    const { timestamp } = JSON.parse(auth);
    // Auth expires after 24 hours
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return Date.now() - timestamp < expiryTime;
  } catch {
    return false;
  }
}

export function setAuthenticated(): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "admin_auth",
    JSON.stringify({
      timestamp: Date.now(),
    })
  );
}

export function clearAuthentication(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("admin_auth");
}
