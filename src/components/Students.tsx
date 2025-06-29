// Students section

import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./Students.module.scss";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";

// Import required modules
import { A11y, Autoplay } from "swiper/modules";

// Icon components
const Icon = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div style={{ width: 24, height: 24 }} className={className}>
    {children}
  </div>
);
const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
const ArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
const Headphones = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
  </svg>
);
const BookOpen = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
const Pencil = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);
const Mic = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);
const Award = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline>
  </svg>
);

const StudentCard = ({ studentItem, language }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animateBack, setAnimateBack] = useState(false);

  const student = studentItem.student;
  const review = getLocalizedText(
    student.review_uz,
    student.review_en,
    language
  );

  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    if (newFlippedState) {
      setTimeout(() => setAnimateBack(true), 200); // Animation delay
    } else {
      setAnimateBack(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!student) return null;

  return (
    <>
      <div
        className={`${styles.flipCardContainer} ${
          isFlipped ? styles.isFlipped : ""
        }`}
      >
        <div className={styles.flipCardInner}>
          {/* Front */}
          <div className={styles.flipCardFront}>
            <div className={styles.cardHeader}>
              <img
                className={styles.profileImage}
                src={student.image}
                alt={`${student.name} ${student.surname}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/144x144/E0E0E0/757575?text=${student.name[0]}.${student.surname[0]}`;
                }}
              />
              <h1
                className={styles.profileName}
              >{`${student.name} ${student.surname}`}</h1>
              <p className={styles.profileTitle}>
                {language === "uz" ? "IELTS Muvaffaqiyati" : "IELTS Achiever"}
              </p>
            </div>

            <div className={styles.scoreDisplay}>
              <p className={styles.label}>
                {language === "uz" ? "Umumiy Ball" : "Overall Band Score"}
              </p>
              <p className={styles.score}>{student.overall.toFixed(1)}</p>
              <p className={styles.cefrBadge}>
                {`CEFR Level: ${student.cefr}`}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <button
                className={`${styles.actionButton} ${styles.primary}`}
                onClick={handleFlip}
              >
                <span>{language === "uz" ? "Batafsil" : "View Details"}</span>
                <Icon>
                  <ArrowRight />
                </Icon>
              </button>
            </div>
          </div>

          {/* Back */}
          <div
            className={`${styles.flipCardBack} ${
              animateBack ? styles.animateBackElements : ""
            }`}
          >
            <div className={styles.backContentWrapper}>
              <h2
                className={`${styles.backTitle} ${styles.animatable}`}
                style={{ animationDelay: "0.1s" }}
              >
                {language === "uz" ? "Ballar Tafsiloti" : "Score Breakdown"}
              </h2>
              <div className={styles.scoreBreakdown}>
                {[
                  {
                    icon: <Headphones />,
                    label: "Listening",
                    score: student.listening,
                    delay: "0.2s",
                  },
                  {
                    icon: <BookOpen />,
                    label: "Reading",
                    score: student.reading,
                    delay: "0.3s",
                  },
                  {
                    icon: <Pencil />,
                    label: "Writing",
                    score: student.writing,
                    delay: "0.4s",
                  },
                  {
                    icon: <Mic />,
                    label: "Speaking",
                    score: student.speaking,
                    delay: "0.5s",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`${styles.scoreItem} ${styles.animatable}`}
                    style={{ animationDelay: item.delay }}
                  >
                    <Icon>{item.icon}</Icon>
                    <p className={styles.label}>{item.label}</p>
                    <p className={styles.score}>{item.score.toFixed(1)}</p>
                  </div>
                ))}
              </div>

              <div className={styles.backContent}>
                <div
                  className={`${styles.certificateLink} ${styles.animatable}`}
                  style={{ animationDelay: "0.6s" }}
                  onClick={openModal}
                >
                  <Icon>
                    <Award />
                  </Icon>
                  <div>
                    <h3 className={styles.title}>
                      {language === "uz"
                        ? "Sertifikatni Ko'rish"
                        : "View Certificate"}
                    </h3>
                    <p className={styles.subtitle}>
                      {language === "uz"
                        ? "Kattalashtirish uchun bosing"
                        : "Click to enlarge"}
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.studentReview} ${styles.animatable}`}
                  style={{ animationDelay: "0.7s" }}
                >
                  <h3 className={styles.title}>
                    {language === "uz" ? "O'quvchi Fikri" : "Student Review"}
                  </h3>
                  <blockquote>
                    <p>"{review}"</p>
                  </blockquote>
                </div>
              </div>
            </div>

            <div
              className={styles.animatable}
              style={{ animationDelay: "0.8s" }}
            >
              <button
                className={`${styles.actionButton} ${styles.secondary}`}
                onClick={handleFlip}
              >
                <Icon>
                  <ArrowLeft />
                </Icon>
                <span>{language === "uz" ? "Orqaga" : "Back to Main"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`${styles.modal} ${isModalOpen ? "" : styles.hidden}`}
        onClick={closeModal}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={student.certificate_photo}
            alt={`${student.name} ${student.surname} IELTS Certificate`}
          />
          <button className={styles.modalCloseButton} onClick={closeModal}>
            &times;
          </button>
        </div>
      </div>
    </>
  );
};

export default function Students() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const webData = useWebDataStore((state) => state.webData);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const sectionTitle =
    language === "uz" ? "Bizning o'quvchilarimiz" : "Our Students";
  const description = webData
    ? getLocalizedText(webData.students_p_uz, webData.students_p_en, language)
    : "";
  const students = webData?.web_students
    ? [...webData.web_students].sort((a, b) => a.order - b.order)
    : [];

  return (
    <section
      id="students"
      className={`${styles.studentsSection} ${styles[theme]}`}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
          <p className={styles.sectionDescription}>{description}</p>
        </div>

        <div
          className={styles.studentsSwiper}
          onMouseEnter={() => swiperInstance?.autoplay.stop()}
          onMouseLeave={() => swiperInstance?.autoplay.start()}
        >
          <Swiper
            modules={[A11y, Autoplay]}
            onSwiper={setSwiperInstance}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            centeredSlides={true}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            className={styles.swiper}
            breakpoints={{
              // when window width is >= 640px
              640: {
                slidesPerView: 1,
              },
              // when window width is >= 768px
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              // when window width is >= 1200px
              1200: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
          >
            {students.map((studentItem) => (
              <SwiperSlide
                key={studentItem.student.id}
                className={styles.swiperSlide}
              >
                <StudentCard studentItem={studentItem} language={language} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
