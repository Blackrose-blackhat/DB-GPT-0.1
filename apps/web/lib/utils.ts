import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const DASHBOARD_KEY = "dbgpt_dashboard";

export function saveDashboardState(state: any) {
  localStorage.setItem(DASHBOARD_KEY, JSON.stringify(state));
}

export function loadDashboardState() {
  const saved = localStorage.getItem(DASHBOARD_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearDashboardState() {
  localStorage.removeItem(DASHBOARD_KEY);
}