export const DEMO_USER = {
  name: "Anthony Demo",
  email: "demo@careerlaunchpad.ai",
  password: "Launchpad@2026",
};

const AUTH_KEY = "career_launchpad_auth";

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

export function loginDemoUser(email: string, password: string): AuthUser | null {
  const matches =
    email.trim().toLowerCase() === DEMO_USER.email.toLowerCase() &&
    password === DEMO_USER.password;

  if (!matches) {
    return null;
  }

  const user = { name: DEMO_USER.name, email: DEMO_USER.email };
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
