import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
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

  return (
    <section id="about" className={`${styles.about} ${styles[theme]}`}>
      <div className={styles.container}>
        <div className={styles.aboutContentWrapper}>
          <div className={styles.aboutHeader}>
            <h2 className={styles.sectionTitle}>Admire haqida</h2>
          </div>

          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p className={styles.aboutDescription}>
                2015 yilda seos solingan Admire o'quv markazi, talabalarni o'z
                sohasiyetini yo'lbagi chiqarishga yordam beruvchi yuqori sifatli
                ta'lim berish bilan shug'ullanadi.
              </p>
              <p className={styles.aboutDescription}>
                Ilmimiy va amaliy qobiliyatlarni rivojlantirish rag'batlantirish
                va ta'lim jarayoniga sifatli ko'rsatish qobiliyati o'quv
                muhlitini yaratishdir.
              </p>
            </div>

            <div className={styles.aboutStats}>
              <StatCard count="500+" label="TALABALAR" />
              <StatCard count="20+" label="7+ OLGAN O'QUVCHILAR" />
              <StatCard count="15+" label="O'QITUVCHILAR" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
