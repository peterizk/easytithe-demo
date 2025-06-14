// src/hooks/useIsAdmin.js
import { useState, useEffect } from "react";

export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/admin/files", {
      method: "HEAD",
      credentials: "include"          // ← include Basic-Auth credentials
    })
      .then(r => setIsAdmin(r.status === 200))
      .catch(() => setIsAdmin(false));
  }, []);

  return isAdmin;
}
