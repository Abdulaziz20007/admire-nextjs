import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IWeb } from "@/types/database";
import styles from "./ContentPreview.module.scss";

interface ContentPreviewProps {
  content: IWeb;
}

export default function ContentPreview({ content }: ContentPreviewProps) {
  const { theme } = useTheme();
  const [language, setLanguage] = useState<"uz" | "en">("en");

  const getLocalizedText = (uzText: string, enText: string) => {
    return language === "uz" ? uzText || enText : enText || uzText;
  };

  return (
    <div className={`${styles.contentPreview} ${styles[theme]}`}>
      {/* Preview Header */}
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Landing Page Preview</h3>
        <div className={styles.languageToggle}>
          <button
            className={`${styles.langButton} ${language === "en" ? styles.active : ""}`}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <button
            className={`${styles.langButton} ${language === "uz" ? styles.active : ""}`}
            onClick={() => setLanguage("uz")}
          >
            O'zbek
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className={styles.previewContent}>
        {/* Hero Section Preview */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            {content.headerImg && (
              <div className={styles.heroImage}>
                <img src={content.headerImg} alt="Header" />
              </div>
            )}
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {getLocalizedText(content.headerH1Uz || "", content.headerH1En || "")}
              </h1>
              <p className={styles.heroSubtitle}>
                {getLocalizedText(content.headerPUz || "", content.headerPEn || "")}
              </p>
              {(content.headerButtonUz || content.headerButtonEn) && (
                <button className={styles.heroButton}>
                  {getLocalizedText(content.headerButtonUz || "", content.headerButtonEn || "")}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* About Section Preview */}
        <section className={styles.aboutSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>About Us</h2>
          </div>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p className={styles.aboutParagraph}>
                {getLocalizedText(content.aboutP1Uz || "", content.aboutP1En || "")}
              </p>
              {(content.aboutP2Uz || content.aboutP2En) && (
                <p className={styles.aboutParagraph}>
                  {getLocalizedText(content.aboutP2Uz || "", content.aboutP2En || "")}
                </p>
              )}
            </div>
            {content.aboutImg && (
              <div className={styles.aboutImage}>
                <img src={content.aboutImg} alt="About" />
              </div>
            )}
          </div>
          
          {/* Statistics */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{content.totalStudents || 0}</div>
              <div className={styles.statLabel}>Total Students</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{content.bestStudents || 0}</div>
              <div className={styles.statLabel}>Best Students</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{content.totalTeachers || 0}</div>
              <div className={styles.statLabel}>Total Teachers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{content.yearsOfExperience || 0}</div>
              <div className={styles.statLabel}>Years Experience</div>
            </div>
          </div>
        </section>

        {/* Contact Section Preview */}
        <section className={styles.contactSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
          </div>
          <div className={styles.contactContent}>
            <div className={styles.contactInfo}>
              {content.email && (
                <div className={styles.contactItem}>
                  <strong>Email:</strong> {content.email}
                </div>
              )}
              {(content.addressUz || content.addressEn) && (
                <div className={styles.contactItem}>
                  <strong>Address:</strong> {getLocalizedText(content.addressUz || "", content.addressEn || "")}
                </div>
              )}
              {(content.workingHoursUz || content.workingHoursEn) && (
                <div className={styles.contactItem}>
                  <strong>Working Hours:</strong> {getLocalizedText(content.workingHoursUz || "", content.workingHoursEn || "")}
                </div>
              )}
              {content.website && (
                <div className={styles.contactItem}>
                  <strong>Website:</strong> <a href={content.website} target="_blank" rel="noopener noreferrer">{content.website}</a>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Preview Note */}
      <div className={styles.previewNote}>
        <p>
          <strong>Note:</strong> This is a simplified preview. The actual landing page may have additional styling and interactive elements.
        </p>
      </div>
    </div>
  );
}
