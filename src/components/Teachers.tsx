import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./Teachers.module.scss";

// Teacher data interface
interface Teacher {
  id: number;
  name: string;
  subtitle: string;
  about: string;
  overallScore: string;
  scoreDisplay: string;
  yearsExperience: string;
  studentsCount: string;
  quote: string;
  image: string;
}

// Teacher Avatar Component
interface TeacherAvatarProps {
  teacher: Teacher;
  isActive: boolean;
  onClick: () => void;
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  teacher,
  isActive,
  onClick,
}) => {
  return (
    <div
      className={`${styles.teacherAvatar} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <div className={styles.avatarWrapper}>
        <img
          src={teacher.image}
          alt={teacher.name}
          className={styles.avatarImage}
          width="500"
          height="500"
        />
      </div>
      {isActive && (
        <div className={styles.avatarNameContainer}>
          <div className={styles.avatarName}>{teacher.name}</div>
          <div className={styles.avatarScore}>IELTS {teacher.overallScore}</div>
        </div>
      )}
    </div>
  );
};

// Teacher Detail Component
interface TeacherDetailProps {
  teacher: Teacher;
  metricLabels: {
    score: string;
    experience: string;
    certification: string;
    students: string;
  };
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({
  teacher,
  metricLabels,
}) => {
  return (
    <div className={styles.teacherDetail}>
      <div className={styles.teacherPhotoWrapper}>
        <img
          src={teacher.image}
          alt={teacher.name}
          className={styles.teacherPhoto}
          width="350"
          height="500"
        />
        <div className={styles.teacherName}>
          <span className={styles.teacherNamePrimary}>{teacher.name}</span>
          <span className={styles.teacherNameSecondary}>
            {teacher.subtitle}
          </span>
        </div>
      </div>

      <div className={styles.teacherMetrics}>
        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>{teacher.scoreDisplay}</div>
          <div className={styles.metricLabel}>{metricLabels.score}</div>
        </div>

        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>{teacher.yearsExperience}+</div>
          <div className={styles.metricLabel}>{metricLabels.experience}</div>
        </div>

        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>CELTA</div>
          <div className={styles.metricLabel}>Sertifikatlangan</div>
        </div>

        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>{teacher.studentsCount}+</div>
          <div className={styles.metricLabel}>{metricLabels.students}</div>
        </div>
      </div>

      <div className={styles.teacherQuote}>
        <div className={styles.quoteMark}>"</div>
        <div className={styles.teacherAbout}>{teacher.about}</div>
        <p>{teacher.quote}</p>
      </div>
    </div>
  );
};

// Main Teachers Component
export default function Teachers() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { webData } = useWebDataStore();
  const [activeTeacher, setActiveTeacher] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get teachers from web data
  const teachers =
    webData?.web_teachers?.map((item) => ({
      id: item.teacher_id,
      name: item.teacher.name,
      subtitle: item.teacher.surname,
      about: getLocalizedText(
        item.teacher.about_uz,
        item.teacher.about_en,
        language
      ),
      overallScore: item.teacher.overall.toString(),
      scoreDisplay: item.teacher.overall.toString(),
      yearsExperience: item.teacher.experience.toString(),
      studentsCount: item.teacher.students.toString(),
      quote: getLocalizedText(
        item.teacher.quote_uz,
        item.teacher.quote_en,
        language
      ),
      image: item.teacher.image,
    })) || [];

  // Get localized section title
  const sectionTitle =
    language === "uz"
      ? "Bizning o'qituvchilarimiz"
      : "Our Experienced Teachers";

  const sectionDescription = webData
    ? getLocalizedText(webData.teachers_p_uz, webData.teachers_p_en, language)
    : "";

  // Localized metric labels
  const metricLabels = {
    score: language === "uz" ? "IELTS bali" : "IELTS score",
    experience: language === "uz" ? "Yillik tajriba" : "Years of experience",
    certification: language === "uz" ? "Sertifikatlangan" : "Certified",
    students: language === "uz" ? "Talabalar" : "Students",
  };

  // Handle auto-rotation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      if (!isPaused) {
        handleTeacherChange((prevIndex) =>
          prevIndex === teachers.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000);

    return () => clearInterval(rotationInterval);
  }, [isPaused]);

  // Reset pause after inactivity
  const resetPauseTimer = () => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 10000);
  };

  // Pause rotation on hover
  const handleMouseEnter = () => {
    setIsPaused(true);
    // Clear any existing timer when mouse enters
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
  };

  // Resume rotation when mouse leaves
  const handleMouseLeave = () => {
    resetPauseTimer();
  };

  const handleTeacherChange = (
    indexOrFunction: number | ((prev: number) => number)
  ) => {
    setIsChanging(true);

    if (typeof indexOrFunction === "function") {
      setActiveTeacher(indexOrFunction);
    } else {
      setActiveTeacher(indexOrFunction);
    }

    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  const handleTeacherClick = (index: number) => {
    handleTeacherChange(index);
    setIsPaused(true);
    resetPauseTimer();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  return (
    <section
      id="teachers"
      className={`${styles.staffSection} ${styles[theme]}`}
    >
      <div className={styles.container}>
        <div className={styles.staffContentWrapper}>
          <div className={styles.staffHeader}>
            <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
            <p className={styles.sectionDescription}>{sectionDescription}</p>
          </div>

          <div
            className={styles.teachersAvatarsContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {teachers.map((teacher, index) => (
              <TeacherAvatar
                key={teacher.id}
                teacher={teacher}
                isActive={index === activeTeacher}
                onClick={() => handleTeacherClick(index)}
              />
            ))}
          </div>

          <div
            className={`${styles.teacherDetailContainer} ${
              isChanging ? styles.fadeTransition : ""
            }`}
          >
            {teachers.length > 0 && (
              <TeacherDetail
                teacher={teachers[activeTeacher]}
                metricLabels={metricLabels}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
