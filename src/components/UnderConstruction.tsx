import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./UnderConstruction.module.scss";

const UnderConstruction: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.underConstruction} ${styles[theme]}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main Icon/Logo */}
          <div className={styles.iconContainer}>
            <div className={styles.constructionIcon}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.icon}
              >
                <path
                  d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M19 15L19.5 17L21 17.5L19.5 18L19 20L18.5 18L17 17.5L18.5 17L19 15Z"
                  fill="currentColor"
                />
                <path
                  d="M5 6L5.5 8L7 8.5L5.5 9L5 11L4.5 9L3 8.5L4.5 8L5 6Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className={styles.mainHeading}>
            Saytimiz Qurilmoqda
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            Biz yanada yaxshi tajriba yaratish uchun ishlamoqdamiz. Tez orada qaytib kelamiz!
          </p>

          {/* Progress Indicator */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
            <p className={styles.progressText}>Tayyorlanmoqda...</p>
          </div>

          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <h3 className={styles.contactHeading}>Biz bilan bog'lanish</h3>
            <div className={styles.contactItems}>
              <div className={styles.contactItem}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                    fill="currentColor"
                  />
                </svg>
                <span>contact@admire.edu</span>
              </div>
              <div className={styles.contactItem}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                    fill="currentColor"
                  />
                </svg>
                <span>+998 90 123 45 67</span>
              </div>
            </div>
          </div>

          {/* Animated Elements */}
          <div className={styles.animatedElements}>
            <div className={styles.floatingElement} style={{ animationDelay: '0s' }}>
              <div className={styles.dot}></div>
            </div>
            <div className={styles.floatingElement} style={{ animationDelay: '1s' }}>
              <div className={styles.dot}></div>
            </div>
            <div className={styles.floatingElement} style={{ animationDelay: '2s' }}>
              <div className={styles.dot}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
