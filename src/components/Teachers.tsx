import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
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

// Static teacher data
const teachersData: Teacher[] = [
  {
    id: 1,
    name: "Dovudxon",
    subtitle: "Abdullaev",
    about:
      "10+ yillik tajribaga ega IELTS o'qituvchisi, talabalarga maqsadli ballarini olishga yordam beradi.",
    overallScore: "9.0",
    scoreDisplay: "9.0",
    yearsExperience: "10+",
    studentsCount: "3500+",
    quote:
      "O'zbekistonda 8-marta IELTS 9.0 ballni qo'lga kiritdim, va bu mening o'zimga bo'lgan ishonchimni yanada oshirdi. Talabalarimning yaxshi natijaga erishishlari uchun barcha bo'limlarga e'tibor qarataman. Ularning natijasi bu mening natijam, shuning uchun har bir talabani o'rgatayotganda, ularni muvaffaqiyatli qilishni o'zimning burchim deb bilaman.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces,top",
  },
  {
    id: 2,
    name: "Asilbek",
    subtitle: "Yusupov",
    about:
      "IELTS uchun akademik yozuv va o'qish ko'nikmalarida ixtisoslashgan.",
    overallScore: "9.0",
    scoreDisplay: "3x9.0",
    yearsExperience: "5+",
    studentsCount: "3000+",
    quote:
      "Men ketma-ket 3 marta IELTS 9.0 ballni oldim. Imkonsiz so'z men uchun emas, va buni siz mening talabalarim natijalarida ko'rishingiz mumkin. Aniq strategiya va yuqori ruh bilan dars o'tish mening kuchli tomonlarimdan biri. Qolganlarini siz darslarimga kelganingizda ko'rishingiz mumkin.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&crop=faces,top",
  },
  {
    id: 3,
    name: "Sarah",
    subtitle: "Johnson",
    about:
      "Yuqori IELTS ballarini olish uchun gapirish ishonchi va talaffuz qilishga e'tibor beradi.",
    overallScore: "8.5",
    scoreDisplay: "8.5",
    yearsExperience: "7+",
    studentsCount: "2500+",
    quote:
      "Tilshunoslik va ta'lim sohasidagi tajriba bilan, men talabalarga nafaqat IELTS balki akademik va professionallik sohalarida ham xizmat qiladigan haqiqiy muloqot ko'nikmalarini rivojlantirishga yordam beraman.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop&crop=faces,top",
  },
  {
    id: 4,
    name: "Michael",
    subtitle: "Smith",
    about:
      "Yozish va gapirish ballarini yaxshilash uchun sinovdan o'tgan usullarga ega grammatika mutaxassisi.",
    overallScore: "8.0",
    scoreDisplay: "8.0",
    yearsExperience: "8+",
    studentsCount: "2800+",
    quote:
      "IELTS tayyorgarligiga mening maxsus yondashuvim har bir talabaning zaif tomonlarini tizimli ravishda aniqlash va ularga murojaat qilishga qaratilgan. Men barcha to'rtta modulda muvaffaqiyatga erishish uchun grammatika va so'z boyligida mustahkam poydevor yaratishga ishonaman.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&crop=faces,top",
  },
  {
    id: 5,
    name: "Emily",
    subtitle: "Wilson",
    about:
      "Tilshunoslik sohasida tajribaga ega o'qish va tinglash strategiyalari bo'yicha mutaxassis.",
    overallScore: "8.5",
    scoreDisplay: "8.5",
    yearsExperience: "6+",
    studentsCount: "2200+",
    quote:
      "Men o'z talabalarimga IELTS shunchaki test emas, balki ularning akademik va kasbiy faoliyati davomida foydali bo'ladigan til ko'nikmalarini rivojlantirish imkoniyati ekanligini o'rgataman. Mening dalillarga asoslangan usullarim yuzlab talabalarga maqsadli ballarini olishga yordam berdi.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=500&fit=crop&crop=faces,top",
  },
  {
    id: 6,
    name: "David",
    subtitle: "Lee",
    about:
      "IELTS muvaffaqiyati uchun test tayyorgarligi va vaqtni boshqarish texnikalarida ixtisoslashgan.",
    overallScore: "8.0",
    scoreDisplay: "8.0",
    yearsExperience: "9+",
    studentsCount: "3100+",
    quote:
      "Mening yondashuvim samarali vaqtni boshqarish strategiyalari bilan psixologik tayyorgarlikni birlashtiradi. IELTS muvaffaqiyati til bilimi kabi ishonch va test strategiyasi ham hisoblanadi, va men o'z talabalarimning barcha jihatlarda tayyor bo'lishini ta'minlayman.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=faces,top",
  },
];

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
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({ teacher }) => {
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
          <div className={styles.metricLabel}>IELTS bali</div>
        </div>

        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>{teacher.yearsExperience}</div>
          <div className={styles.metricLabel}>Yillik tajriba</div>
        </div>

        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>CELTA</div>
          <div className={styles.metricLabel}>Sertifikatlangan</div>
        </div>

        <div className={styles.teacherMetric}>
          <div className={styles.metricValue}>{teacher.studentsCount}</div>
          <div className={styles.metricLabel}>Talabalar</div>
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
  const [activeTeacher, setActiveTeacher] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-rotation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      if (!isPaused) {
        handleTeacherChange((prevIndex) =>
          prevIndex === teachersData.length - 1 ? 0 : prevIndex + 1
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
            <h2 className={styles.sectionTitle}>
              Bizning tajribali o'qituvchilarimiz
            </h2>
            <p className={styles.sectionDescription}>
              Talabalarning maqsadli ballarini olishga yordam berishda
              isbotlangan tajribaga ega yuqori malakali IELTS o'qituvchilarimiz
              bilan tanishing.
            </p>
          </div>

          <div className={styles.teachersAvatarsContainer}>
            {teachersData.map((teacher, index) => (
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <TeacherDetail teacher={teachersData[activeTeacher]} />
          </div>
        </div>
      </div>
    </section>
  );
}
