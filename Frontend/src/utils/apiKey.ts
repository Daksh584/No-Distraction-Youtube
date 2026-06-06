const STORAGE_KEY = "edutube_yt_api_key";

export function getYouTubeApiKey(): string {
  if (typeof window !== "undefined") {
    const userKey = localStorage.getItem(STORAGE_KEY);
    if (userKey && userKey.trim().length > 0) {
      return userKey.trim();
    }
  }
  return process.env.NEXT_PUBLIC_YT_KEY || "";
}

export function setUserApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim().length > 0) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function getUserApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY) || "";
  }
  return "";
}

export function isUsingCustomKey(): boolean {
  if (typeof window !== "undefined") {
    const key = localStorage.getItem(STORAGE_KEY);
    return !!key && key.trim().length > 0;
  }
  return false;
}
