import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "uz";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("uz");
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    const browserLanguage = navigator.language.startsWith("uz") ? "uz" : "en";

    const initialLanguage = savedLanguage || browserLanguage;
    setLanguageState(initialLanguage);
    setMounted(true);
  }, []);

  // Save language preference
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("lang", language);
      localStorage.setItem("language", language);
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguageState((prevLanguage) => (prevLanguage === "en" ? "uz" : "en"));
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
