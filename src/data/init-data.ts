/**
 * Pre-stored initialization data for database setup
 * This data will be used by the /api/admin/init endpoint
 */

export const initializationData = {
  Web: [
    {
      header_img: "/images/header_building.png",
      header_h1_uz: "Admire Ingliz tili o'rganish markazi",
      header_h1_en: "Admire English Language Learning Center",
      about_p1_uz: "2015 yilda asos solingan Admire o'quv markazi, talabalarni o'z sohasini yo'lga chiqarishga yordam beruvchi yuqori sifatli ta'lim berish bilan shug'ullanadi.",
      about_p1_en: "Founded in 2015, Admire Learning Center is dedicated to providing high-quality education to help students pave their way in their respective fields.",
      about_p2_uz: "Ilmiy va amaliy qobiliyatlarni rivojlantirishni rag'batlantirib, ta'lim jarayoniga sifatli yondashuvni ta'minlaydigan o'quv muhitini yaratish.",
      about_p2_en: "Creating a learning environment that encourages the development of academic and practical skills and ensures a quality approach to the educational process.",
      total_students: 500,
      best_students: 20,
      total_teachers: 15,
      gallery_p_uz: "Ta'lim jarayoni, talabalar hayoti va muvaffaqiyatlarimizdan lavhalar. Admire o'quv markazidagi faol ta'lim muhiti va yutuqlarimiz bilan tanishing.",
      gallery_p_en: "Highlights from our educational process, student life, and successes. Get acquainted with the active learning environment and achievements at Admire Learning Center.",
      teachers_p_uz: "Talabalarning maqsadli ballarini olishga yordam berishda isbotlangan tajribaga ega yuqori malakali IELTS o'qituvchilarimiz bilan tanishing.",
      teachers_p_en: "Meet our highly qualified IELTS teachers with proven experience in helping students achieve their target scores.",
      students_p_uz: "",
      students_p_en: "Discover how our students are achieving success and shaping their futures with the support of our platform.",
      address_uz: "Bobur ko'chasi 23",
      address_en: "23 Bobur Street",
      orientation_uz: "Transport litseyi yonida",
      orientation_en: "Next to the Transport Lyceum",
      work_time: "09:00 - 19:00",
      work_time_sunday: "Dam olish kuni",
      footer_p_uz: "Kelajakni ta'lim orqali qurish",
      footer_p_en: "Building the future through education",
      email: "contact@admire.edu",
      extended_address_uz: "23 Bobur ko'chasi, Andijon, O'zbekiston",
      extended_address_en: "23 Bobur Street, Andijan, Uzbekistan",
      phones: [
        "+998 90 123 45 67"
      ],
      socials: [
        {
          name: "linkedin",
          url: "https://www.linkedin.com/in/",
          icon_url: "/icons/linkedin.svg"
        },
        {
          name: "instagram",
          url: "https://www.instagram.com/",
          icon_url: "/icons/instagram.svg"
        },
        {
          name: "telegram",
          url: "https://t.me/",
          icon_url: "/icons/telegram.svg"
        },
        {
          name: "facebook",
          url: "https://www.facebook.com/",
          icon_url: "/icons/facebook.svg"
        }
      ],
      gallery: [
        {
          alt: "Graduation caps being thrown in the air",
          title: "Graduation Day",
          category: "student life",
          size: "1x1",
          url: "/images/gallery_1_graduation.png"
        },
        {
          alt: "Teacher at the front of a classroom",
          title: "Interactive Lessons",
          category: "classroom",
          size: "1x1",
          url: "/images/gallery_2_classroom_teacher.png"
        },
        {
          alt: "Tutor helping a student",
          title: "Personalized Tutoring",
          category: "learning",
          size: "1x2",
          url: "/images/gallery_3_tutoring.png"
        },
        {
          alt: "Students studying together in a cafe",
          title: "Group Study Sessions",
          category: "student life",
          size: "1x1",
          url: "/images/gallery_4_group_study.png"
        },
        {
          alt: "Students in a lecture hall",
          title: "Engaging Lectures",
          category: "learning",
          size: "1x1",
          url: "/images/gallery_5_lecture_hall.png"
        },
        {
          alt: "Female student holding books",
          title: "Our dedicated student",
          category: "student life",
          size: "1x2",
          url: "/images/gallery_6_student_books.png"
        },
        {
          alt: "Group of smiling children",
          title: "Future Leaders",
          category: "community",
          size: "1x1",
          url: "/images/gallery_7_children.png"
        },
        {
          alt: "A person writing in a notebook",
          title: "Diligent Study",
          category: "learning",
          size: "1x1",
          url: "/images/gallery_8_writing.png"
        },
        {
          alt: "An apple and blocks on a stack of books",
          title: "Foundation of Knowledge",
          category: "education",
          size: "1x1",
          url: "/images/gallery_9_apple_books.png"
        },
        {
          alt: "A hand selecting a book from a bookshelf",
          title: "Resourceful Library",
          category: "resources",
          size: "1x1",
          url: "/images/gallery_10_bookshelf.png"
        }
      ]
    }
  ],
  Teacher: [
    {
      name: "Sarah",
      surname: "Johnson",
      about: "CELTA Certified. Yuqori IELTS ballarini olish uchun gapirish ishonchi va talaffuzga e'tibor berish muhim.",
      quote: "Tilshunoslik va ta'lim sohasidagi tajribam bilan, men talabalarga nafaqat akademik va professionallik sohalarida ham xizmat qiladigan mustahkam ko'nikmalarni rivojlantirishga yordam beraman.",
      image: "/images/teacher_sarah.png",
      overall: 8.5,
      listening: 9.0,
      reading: 8.5,
      writing: 8.0,
      speaking: 8.5,
      cefr: "C2",
      experience: 7,
      students: 2500
    },
    {
      name: "Michael",
      surname: "Brown",
      about: "Expert in exam preparation strategies and time management.",
      quote: "Success is the sum of small efforts, repeated day in and day out.",
      image: "/images/teacher_avatar_1.png",
      overall: 8.0,
      listening: 8.0,
      reading: 8.5,
      writing: 7.5,
      speaking: 8.0,
      cefr: "C1",
      experience: 6,
      students: 1800
    },
    {
      name: "John",
      surname: "Doe",
      about: "Focuses on conversational English and building fluency.",
      quote: "Language is the road map of a culture. It tells you where its people come from and where they are going.",
      image: "/images/teacher_avatar_2.png",
      overall: 8.0,
      listening: 8.5,
      reading: 7.5,
      writing: 7.5,
      speaking: 8.5,
      cefr: "C1",
      experience: 8,
      students: 2200
    }
  ],
  Student: []
} as const;

export default initializationData;
