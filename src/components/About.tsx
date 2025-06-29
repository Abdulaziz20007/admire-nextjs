import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./About.module.scss";

// Stats Card Component
const StatCard = ({ count, label }: { count: string; label: string }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCount}>{count}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
};

export default function About() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const webData = useWebDataStore((state) => state.webData);

  // Localized labels
  const sectionTitle = language === "uz" ? "Admire haqida" : "About Admire";
  const studentsLabel = language === "uz" ? "TALABALAR" : "STUDENTS";
  const bestStudentsLabel =
    language === "uz" ? "7+ OLGAN O'QUVCHILAR" : "STUDENTS WITH 7+";
  const teachersLabel = language === "uz" ? "O'QITUVCHILAR" : "TEACHERS";

  return (
    <section id="about" className={`${styles.about} ${styles[theme]}`}>
      <div className={styles.container}>
        <div className={styles.aboutContentWrapper}>
          <div className={styles.aboutHeader}>
            <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
          </div>

          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              {webData && (
                <>
                  <p className={styles.aboutDescription}>
                    {getLocalizedText(
                      webData.about_p1_uz,
                      webData.about_p1_en,
                      language
                    )}
                  </p>
                  <p className={styles.aboutDescription}>
                    {getLocalizedText(
                      webData.about_p2_uz,
                      webData.about_p2_en,
                      language
                    )}
                  </p>
                </>
              )}
            </div>

            <div className={styles.aboutStats}>
              {webData && (
                <>
                  <StatCard
                    count={`${webData.total_students}+`}
                    label={studentsLabel}
                  />
                  <StatCard
                    count={`${webData.best_students}+`}
                    label={bestStudentsLabel}
                  />
                  <StatCard
                    count={`${webData.total_teachers}+`}
                    label={teachersLabel}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
