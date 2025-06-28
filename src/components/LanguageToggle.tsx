import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./Navbar.module.scss";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.languageToggleContainer} ref={dropdownRef}>
      <button
        className={styles.languageToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <img
          src={
            language === "en"
              ? "/assets/flags/usa.svg"
              : "/assets/flags/uzb.svg"
          }
          alt={language === "en" ? "English" : "O'zbek"}
          className={styles.flagIcon}
        />
        <span className={styles.languageCode}>{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className={`${styles.languageDropdown} ${styles[theme]}`}>
          <button
            className={`${styles.languageOption} ${
              language === "en" ? styles.active : ""
            }`}
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
            }}
          >
            <img
              src="/assets/flags/usa.svg"
              alt="English"
              className={styles.flagIcon}
            />
            <span>English</span>
          </button>
          <button
            className={`${styles.languageOption} ${
              language === "uz" ? styles.active : ""
            }`}
            onClick={() => {
              setLanguage("uz");
              setIsOpen(false);
            }}
          >
            <img
              src="/assets/flags/uzb.svg"
              alt="O'zbek"
              className={styles.flagIcon}
            />
            <span>O'zbek</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
