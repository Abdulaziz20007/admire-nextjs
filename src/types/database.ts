import { Document, Types } from 'mongoose';

// Base interface for all documents
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin Priority Enum
export enum AdminPriority {
  BLOCKED = '0',
  MESSAGE_ACCESS = '1',
  CONTENT_ACCESS = '2',
  FULL_ACCESS = '3'
}

// Media Size Enum
export enum MediaSize {
  STANDARD = '1x1',
  TALL = '1x2'
}

// CEFR Level Enum
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

// Admin Interface
export interface IAdmin extends BaseDocument {
  name: string;
  surname: string;
  username: string;
  password: string;
  avatar?: string;
  priority: AdminPriority;
}

// Teacher Interface
export interface ITeacher extends BaseDocument {
  name: string;
  surname: string;
  about: string;
  quote: string;
  image: string;
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  cefr: CEFRLevel;
  experience: number;
  students: number;
}

// Student Interface
export interface IStudent extends BaseDocument {
  name: string;
  surname: string;
  image: string;
  certificate: string;
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  cefr: CEFRLevel;
  comment: string;
}

// Media Interface
export interface IMedia extends BaseDocument {
  name: string;
  type: boolean; // true for video, false for image
  url: string;
}

// Phone Interface
export interface IPhone extends BaseDocument {
  phone: string;
}

// Icon Interface
export interface IIcon extends BaseDocument {
  name: string;
  url: string;
}

// Social Interface
export interface ISocial extends BaseDocument {
  icon: Types.ObjectId | IIcon;
  name: string;
  url: string;
}

// Message Interface
export interface IMessage extends BaseDocument {
  name: string;
  phone: string;
  message: string;
  isChecked: boolean;
  updatedAdmin: Types.ObjectId | IAdmin;
  isTelegram: boolean;
}

// Web Content Interface (Main site configuration)
export interface IWeb extends BaseDocument {
  // Header content
  headerImg: string;
  headerH1Uz: string;
  headerH1En: string;
  
  // About section
  aboutP1Uz: string;
  aboutP1En: string;
  aboutP2Uz: string;
  aboutP2En: string;
  
  // Statistics
  totalStudents: number;
  bestStudents: number;
  totalTeachers: number;
  
  // Gallery section
  galleryPUz: string;
  galleryPEn: string;
  
  // Teachers section
  teachersPUz: string;
  teachersPEn: string;
  
  // Students section
  studentsPUz: string;
  studentsPEn: string;
  
  // Contact information
  addressUz: string;
  addressEn: string;
  orientationUz: string;
  orientationEn: string;
  workTime: string;
  workTimeSunday: string;
  extendedAddressUz: string;
  extendedAddressEn: string;
  email: string;
  mainPhone: Types.ObjectId | IPhone;
  
  // Footer
  footerPUz: string;
  footerPEn: string;
  
  // Relations
  phones: Types.ObjectId[] | IPhone[];
  teachers: Types.ObjectId[] | ITeacher[];
  students: Types.ObjectId[] | IStudent[];
  media: IWebMedia[];
  socials: Types.ObjectId[] | ISocial[];
}

// Web Media Interface (Gallery items)
export interface IWebMedia extends BaseDocument {
  alt: string;
  title: string;
  category: string;
  size: MediaSize;
  web: Types.ObjectId | IWeb;
  media: Types.ObjectId | IMedia;
}

// Input types for creating/updating documents (without MongoDB-specific fields)
export type AdminInput = Omit<IAdmin, keyof BaseDocument | 'password'> & {
  password?: string;
};

export type TeacherInput = Omit<ITeacher, keyof BaseDocument>;
export type StudentInput = Omit<IStudent, keyof BaseDocument>;
export type MediaInput = Omit<IMedia, keyof BaseDocument>;
export type PhoneInput = Omit<IPhone, keyof BaseDocument>;
export type IconInput = Omit<IIcon, keyof BaseDocument>;
export type SocialInput = Omit<ISocial, keyof BaseDocument>;
export type MessageInput = Omit<IMessage, keyof BaseDocument>;
export type WebInput = Omit<IWeb, keyof BaseDocument>;
export type WebMediaInput = Omit<IWebMedia, keyof BaseDocument>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filter?: Record<string, any>;
}

// Authentication types
export interface AuthTokenPayload {
  adminId: string;
  username: string;
  priority: AdminPriority;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse extends ApiResponse {
  data?: {
    admin: Omit<IAdmin, 'password'>;
    accessToken: string;
    refreshToken: string;
  };
}
