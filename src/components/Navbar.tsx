import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./Navbar.module.scss";

// Logo component
const Logo = () => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <button
      onClick={handleLogoClick}
      className={styles.logoContainer}
      aria-label="Navigate to home page"
    >
      <img src="/logo.svg" alt="Admire Logo" className={styles.logoSvg} />
      <div className={styles.logoText}>
        <div className={styles.logoMain}>admire</div>
        <div className={styles.logoSecondary}>learning center</div>
      </div>
    </button>
  );
};

// Theme Toggle component
const ThemeToggle = ({
  toggle,
  currentTheme,
}: {
  toggle: () => void;
  currentTheme: string;
}) => {
  return (
    <button
      onClick={toggle}
      className={styles.themeToggle}
      aria-label={`Switch to ${
        currentTheme === "light" ? "dark" : "light"
      } mode`}
    >
      {/* Sun icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${styles.themeToggleIcon} ${styles.sun} ${
          currentTheme === "dark" ? styles.active : styles.inactive
        }`}
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>

      {/* Moon icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${styles.themeToggleIcon} ${styles.moon} ${
          currentTheme === "light" ? styles.active : styles.inactive
        }`}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
  );
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicks outside the navbar to close the mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isMenuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Smooth scroll function
  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { key: "home", label: "Home", sectionId: "home" },
    { key: "about", label: "About", sectionId: "about" },
    { key: "teachers", label: "Teachers", sectionId: "teachers" },
    { key: "students", label: "Students", sectionId: "students" },
    { key: "contact", label: "Contact", sectionId: "contact" },
  ];

  return (
    <nav
      ref={navRef}
      className={`${styles.navbar} ${styles[theme]} ${
        scrolled ? styles.scrolled : ""
      } ${isMenuOpen ? styles.menuOpen : ""}`}
    >
      <div className={styles.container}>
        <Logo />

        {/* Navigation Links */}
        <div
          className={`${styles.navMenu} ${styles[theme]} ${
            isMenuOpen ? styles.open : ""
          }`}
        >
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={`#${item.sectionId}`}
                  className={styles.navLink}
                  onClick={(e) => scrollToSection(item.sectionId, e)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.navControls}>
          {/* Theme Toggle */}
          <ThemeToggle toggle={toggleTheme} currentTheme={theme} />

          {/* Mobile menu toggle */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
