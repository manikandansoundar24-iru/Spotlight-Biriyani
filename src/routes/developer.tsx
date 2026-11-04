import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/developer")({
  component: DeveloperRedirect,
});

function DeveloperRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/app/developer", replace: true });
  }, [navigate]);
  return null;
}
