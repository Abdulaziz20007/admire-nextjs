export interface WebData {
  id: number;
  header_img: string;
  header_h1_uz: string;
  header_h1_en: string;
  about_p1_uz: string;
  about_p1_en: string;
  about_p2_uz: string;
  about_p2_en: string;
  total_students: number;
  best_students: number;
  total_teachers: number;
  gallery_p_uz: string;
  gallery_p_en: string;
  teachers_p_uz: string;
  teachers_p_en: string;
  students_p_uz: string;
  students_p_en: string;
  address_uz: string;
  address_en: string;
  orientation_uz: string;
  orientation_en: string;
  work_time: string;
  work_time_sunday: string;
  footer_p_uz: string;
  footer_p_en: string;
  main_phone_id: number;
  email: string;
  extended_address_uz: string;
  extended_address_en: string;
  is_active: boolean;
  main_phone: Phone;
  web_media: WebMedia[];
  web_phones: WebPhone[];
  web_socials: WebSocial[];
  web_students: WebStudent[];
  web_teachers: WebTeacher[];
}

export interface Phone {
  id: number;
  phone: string;
}

export interface WebPhone {
  id: number;
  web_id: number;
  phone_id: number;
  phone: Phone;
}

export interface Media {
  id: number;
  name: string;
  is_video: boolean;
  url: string;
}

export interface WebMedia {
  id: number;
  title_uz?: string;
  title_en?: string;
  alt_uz?: string;
  alt_en?: string;
  category_uz?: string;
  category_en?: string;
  order: number;
  size: string;
  web_id: number;
  media_id: number;
  media: Media;
}

export interface Icon {
  id: number;
  name: string;
  url: string;
}

export interface Social {
  id: number;
  name: string;
  url: string;
  icon_id: number;
  icon: Icon;
}

export interface WebSocial {
  id: number;
  web_id: number;
  social_id: number;
  social: Social;
}

export interface Student {
  id: number;
  name: string;
  surname: string;
  image: string;
  certificate_image: string;
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  cefr: string;
  review_uz: string;
  review_en: string;
}

export interface WebStudent {
  id: number;
  order: number;
  web_id: number;
  student_id: number;
  student: Student;
}

export interface Teacher {
  id: number;
  name: string;
  surname: string;
  about_uz: string;
  about_en: string;
  quote_uz: string;
  quote_en: string;
  image: string;
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  cefr: string;
  experience: number;
  students: number;
}

export interface WebTeacher {
  id: number;
  order: number;
  web_id: number;
  teacher_id: number;
  teacher: Teacher;
}
