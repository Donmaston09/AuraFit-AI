const AUTH_KEY = "aurafit_auth";

export type AuthUser = {
  name: string;
  email: string;
};

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function loginStoredUser(email: string): AuthUser | null {
  const user = getStoredUser();

  if (!user || user.email !== email.trim().toLowerCase()) {
    return null;
  }

  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function registerUser(name: string, email: string): AuthUser {
  const user = { name: name.trim(), email: email.trim().toLowerCase() };
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_KEY);
  }
}
