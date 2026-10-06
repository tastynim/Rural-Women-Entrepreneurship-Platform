import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("lang") || "en"
  );

  const toggleLang = () => {
    const next = lang === "en" ? "bn" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  // Helper: pick the right string from a bilingual object { en, bn }
  const t = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj["en"] || "";
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
