import { useState, useEffect } from "react";

export default function useIsAdmin() {
  const [isAdmin, set] = useState(false);

  useEffect(() => {
    // A HEAD is enough; backend will return 200 if creds are cached, 401 otherwise
    fetch("/admin/files", { method: "HEAD" })
      .then(r => set(r.status === 200))
      .catch(() => set(false));    // network error ⇒ treat as guest
  }, []);

  return isAdmin;
}
