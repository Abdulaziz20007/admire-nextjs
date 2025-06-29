import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./Header.module.scss";

export default function Header() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const webData = useWebDataStore((state) => state.webData);

  // Smooth scroll function (similar to navbar implementation)
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle scroll to about section
  const handleScrollToAbout = () => {
    scrollToSection("about");
  };

  // Handle keyboard navigation for scroll indicator
  const handleScrollKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleScrollToAbout();
    }
  };

  // Get localized button text
  const buttonText = language === "uz" ? "Boshlash" : "Get Started";

  return (
    <header
      id="home"
      className={`${styles.header} ${styles[theme]}`}
      role="banner"
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left side - Building Image */}
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              {webData?.header_img && (
                <img
                  src={webData.header_img}
                  alt={
                    language === "uz"
                      ? "Admire o'quv markazi binosi"
                      : "Admire Learning Center Building"
                  }
                  className={styles.buildingImage}
                />
              )}
            </div>
          </div>

          {/* Right side - Text Content */}
          <div className={styles.textSection}>
            <div className={styles.textContent}>
              <h1 className={styles.mainHeading}>
                {language === "uz"
                  ? "Admire Ingliz tili o'rganish markazi"
                  : "Admire English Learning Center"}
              </h1>
              <p className={styles.subtitle}>
                {webData &&
                  getLocalizedText(
                    webData.header_h1_uz,
                    webData.header_h1_en,
                    language
                  )}
              </p>
              <div className={styles.buttonGroup}>
                <button className={styles.ctaButton}>{buttonText}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className={styles.scrollIndicator}>
        <button
          className={styles.scrollButton}
          onClick={handleScrollToAbout}
          onKeyDown={handleScrollKeyDown}
          aria-label="Scroll to about section"
          tabIndex={0}
        >
          <div className={styles.mouseIcon}>
            <div className={styles.mouseWheel}></div>
          </div>
        </button>
      </div>
    </header>
  );
}
