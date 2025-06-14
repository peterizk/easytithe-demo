// src/components/SettingsCog.jsx
import { useState, useRef, useEffect } from "react";
import { Cog } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function SettingsCog() {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const { pathname } = useLocation();

  // Only show the cog on admin routes
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (box.current && !box.current.contains(event.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={box} className="absolute top-3 right-3 text-gray-600">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Settings"
      >
        <Cog />
      </button>

      {open && (
        <div className="admin-menu absolute right-0 mt-2">
          <a href="/admin/files" className="block px-3 py-1 hover:bg-gray-100">
            Files
          </a>
          <a href="/admin/content" className="block px-3 py-1 hover:bg-gray-100">
            Content
          </a>
        </div>
      )}
    </div>
  );
}
