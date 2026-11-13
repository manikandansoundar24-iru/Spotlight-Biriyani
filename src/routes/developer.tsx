import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/developer")({
  component: DeveloperRedirect,
});

function DeveloperRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = sessionStorage.getItem("spotlight_auth_role") || localStorage.getItem("spotlight_auth_role");
      const sessionActive = sessionStorage.getItem("spotlight_session_active") === "true";
      if (sessionActive && role === "developer") {
        navigate({ to: "/app/developer", replace: true });
      } else {
        navigate({ to: "/login", search: { role: "developer" }, replace: true });
      }
    }
  }, [navigate]);
  return null;
}
