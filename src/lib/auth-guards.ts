import { redirect } from "@tanstack/react-router";

export function redirectIfAuth() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      throw redirect({ to: "/dashboard" });
    }
  }
}
