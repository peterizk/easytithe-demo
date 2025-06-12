import { useState, useRef, useEffect } from "react";
import { Cog } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsCog() {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const h = e => box.current && !box.current.contains(e.target) && setOpen(false);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, []);

  return (
    <div ref={box} className="absolute top-3 right-3 text-gray-600">
      <button onClick={() => setOpen(!open)}><Cog /></button>
      {open && (
        <div className="bg-white shadow-lg rounded text-sm p-2 border mt-2">
          <Link className="block px-3 py-1 hover:bg-gray-100" to="/admin/files">
            Files
          </Link>
          <Link className="block px-3 py-1 hover:bg-gray-100" to="/admin/content">
            Content
          </Link>
        </div>
      )}
    </div>
  );
}
