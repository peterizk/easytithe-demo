import { useEffect } from "react";

export default function EasyTitheForm() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://forms.ministryforms.net/embed.aspx?formId=60125f9c-8124-4525-91b0-ea4be6c36021";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="mf-60125f9c-8124-4525-91b0-ea4be6c36021"
      style={{ width: "100%" }}
    />
  );
}