import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import {
  IAdmin,
  ITeacher,
  IStudent,
  IMedia,
  IPhone,
  IIcon,
  ISocial,
  IMessage,
  IWeb,
  IWebMedia,
  AdminPriority,
  MediaSize,
  CEFRLevel,
} from "@/types/database";

// Admin Schema
const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
      maxlength: [255, "Surname cannot exceed 255 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [255, "Username cannot exceed 255 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: Object.values(AdminPriority),
      default: AdminPriority.BLOCKED,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT || "10");
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Teacher Schema
const TeacherSchema = new Schema<ITeacher>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
      maxlength: [255, "Surname cannot exceed 255 characters"],
    },
    about: {
      type: String,
      required: [true, "About section is required"],
      maxlength: [1000, "About section cannot exceed 1000 characters"],
    },
    quote: {
      type: String,
      required: [true, "Quote is required"],
      maxlength: [500, "Quote cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    overall: {
      type: Number,
      required: [true, "Overall score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    listening: {
      type: Number,
      required: [true, "Listening score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    reading: {
      type: Number,
      required: [true, "Reading score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    writing: {
      type: Number,
      required: [true, "Writing score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    speaking: {
      type: Number,
      required: [true, "Speaking score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    cefr: {
      type: String,
      enum: Object.values(CEFRLevel),
      required: [true, "CEFR level is required"],
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    students: {
      type: Number,
      required: [true, "Number of students is required"],
      min: [0, "Number of students cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Student Schema
const StudentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
      maxlength: [255, "Surname cannot exceed 255 characters"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    certificate: {
      type: String,
      required: [true, "Certificate is required"],
    },
    overall: {
      type: Number,
      required: [true, "Overall score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    listening: {
      type: Number,
      required: [true, "Listening score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    reading: {
      type: Number,
      required: [true, "Reading score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    writing: {
      type: Number,
      required: [true, "Writing score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    speaking: {
      type: Number,
      required: [true, "Speaking score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    cefr: {
      type: String,
      enum: Object.values(CEFRLevel),
      required: [true, "CEFR level is required"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Media Schema
const MediaSchema = new Schema<IMedia>(
  {
    name: {
      type: String,
      required: [true, "Media name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    type: {
      type: Boolean,
      required: [true, "Media type is required"],
      // true for video, false for image
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Message Schema
const MessageSchema = new Schema<IMessage>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [255, "Phone number cannot exceed 255 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    updatedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Updated admin is required"],
    },
    isTelegram: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Web Media Schema (Gallery items)
const WebMediaSchema = new Schema<IWebMedia>(
  {
    alt: {
      type: String,
      required: [true, "Alt text is required"],
      trim: true,
      maxlength: [255, "Alt text cannot exceed 255 characters"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [255, "Title cannot exceed 255 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [255, "Category cannot exceed 255 characters"],
    },
    size: {
      type: String,
      enum: Object.values(MediaSize),
      default: MediaSize.STANDARD,
      required: true,
    },
    web: {
      type: Schema.Types.ObjectId,
      ref: "Web",
      required: [true, "Web reference is required"],
    },
    media: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: [true, "Media reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Web Schema (Main site configuration)
const WebSchema = new Schema<IWeb>(
  {
    // Header content
    headerImg: {
      type: String,
      required: [true, "Header image is required"],
    },
    headerH1Uz: {
      type: String,
      required: [true, "Header H1 (Uzbek) is required"],
      maxlength: [500, "Header H1 cannot exceed 500 characters"],
    },
    headerH1En: {
      type: String,
      required: [true, "Header H1 (English) is required"],
      maxlength: [500, "Header H1 cannot exceed 500 characters"],
    },

    // About section
    aboutP1Uz: {
      type: String,
      required: [true, "About paragraph 1 (Uzbek) is required"],
      maxlength: [2000, "About paragraph cannot exceed 2000 characters"],
    },
    aboutP1En: {
      type: String,
      required: [true, "About paragraph 1 (English) is required"],
      maxlength: [2000, "About paragraph cannot exceed 2000 characters"],
    },
    aboutP2Uz: {
      type: String,
      required: [true, "About paragraph 2 (Uzbek) is required"],
      maxlength: [2000, "About paragraph cannot exceed 2000 characters"],
    },
    aboutP2En: {
      type: String,
      required: [true, "About paragraph 2 (English) is required"],
      maxlength: [2000, "About paragraph cannot exceed 2000 characters"],
    },

    // Statistics
    totalStudents: {
      type: Number,
      required: [true, "Total students count is required"],
      min: [0, "Count cannot be negative"],
    },
    bestStudents: {
      type: Number,
      required: [true, "Best students count is required"],
      min: [0, "Count cannot be negative"],
    },
    totalTeachers: {
      type: Number,
      required: [true, "Total teachers count is required"],
      min: [0, "Count cannot be negative"],
    },

    // Gallery section
    galleryPUz: {
      type: String,
      required: [true, "Gallery description (Uzbek) is required"],
      maxlength: [1000, "Gallery description cannot exceed 1000 characters"],
    },
    galleryPEn: {
      type: String,
      required: [true, "Gallery description (English) is required"],
      maxlength: [1000, "Gallery description cannot exceed 1000 characters"],
    },

    // Teachers section
    teachersPUz: {
      type: String,
      required: [true, "Teachers description (Uzbek) is required"],
      maxlength: [1000, "Teachers description cannot exceed 1000 characters"],
    },
    teachersPEn: {
      type: String,
      required: [true, "Teachers description (English) is required"],
      maxlength: [1000, "Teachers description cannot exceed 1000 characters"],
    },

    // Students section
    studentsPUz: {
      type: String,
      required: [true, "Students description (Uzbek) is required"],
      maxlength: [1000, "Students description cannot exceed 1000 characters"],
    },
    studentsPEn: {
      type: String,
      required: [true, "Students description (English) is required"],
      maxlength: [1000, "Students description cannot exceed 1000 characters"],
    },

    // Contact information
    addressUz: {
      type: String,
      required: [true, "Address (Uzbek) is required"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    addressEn: {
      type: String,
      required: [true, "Address (English) is required"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    orientationUz: {
      type: String,
      required: [true, "Orientation (Uzbek) is required"],
      maxlength: [1000, "Orientation cannot exceed 1000 characters"],
    },
    orientationEn: {
      type: String,
      required: [true, "Orientation (English) is required"],
      maxlength: [1000, "Orientation cannot exceed 1000 characters"],
    },
    workTime: {
      type: String,
      required: [true, "Work time is required"],
      maxlength: [255, "Work time cannot exceed 255 characters"],
    },
    workTimeSunday: {
      type: String,
      required: [true, "Sunday work time is required"],
      maxlength: [255, "Work time cannot exceed 255 characters"],
    },
    extendedAddressUz: {
      type: String,
      required: [true, "Extended address (Uzbek) is required"],
      maxlength: [1000, "Extended address cannot exceed 1000 characters"],
    },
    extendedAddressEn: {
      type: String,
      required: [true, "Extended address (English) is required"],
      maxlength: [1000, "Extended address cannot exceed 1000 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    mainPhone: {
      type: Schema.Types.ObjectId,
      ref: "Phone",
      required: [true, "Main phone is required"],
    },

    // Footer
    footerPUz: {
      type: String,
      required: [true, "Footer description (Uzbek) is required"],
      maxlength: [1000, "Footer description cannot exceed 1000 characters"],
    },
    footerPEn: {
      type: String,
      required: [true, "Footer description (English) is required"],
      maxlength: [1000, "Footer description cannot exceed 1000 characters"],
    },

    // Relations
    phones: [
      {
        type: Schema.Types.ObjectId,
        ref: "Phone",
      },
    ],
    teachers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    media: [
      {
        type: Schema.Types.ObjectId,
        ref: "WebMedia",
      },
    ],
    socials: [
      {
        type: Schema.Types.ObjectId,
        ref: "Social",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Phone Schema
const PhoneSchema = new Schema<IPhone>(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [255, "Phone number cannot exceed 255 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Icon Schema
const IconSchema = new Schema<IIcon>(
  {
    name: {
      type: String,
      required: [true, "Icon name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    url: {
      type: String,
      required: [true, "Icon URL is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Social Schema
const SocialSchema = new Schema<ISocial>(
  {
    icon: {
      type: Schema.Types.ObjectId,
      ref: "Icon",
      required: [true, "Icon is required"],
    },
    name: {
      type: String,
      required: [true, "Social media name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    url: {
      type: String,
      required: [true, "Social media URL is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
AdminSchema.index({ username: 1 }, { unique: true });
AdminSchema.index({ priority: 1 });

TeacherSchema.index({ name: 1, surname: 1 });
TeacherSchema.index({ cefr: 1 });
TeacherSchema.index({ experience: -1 });

StudentSchema.index({ name: 1, surname: 1 });
StudentSchema.index({ cefr: 1 });
StudentSchema.index({ overall: -1 });

MediaSchema.index({ type: 1 });
MediaSchema.index({ name: 1 });

MessageSchema.index({ isChecked: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ updatedAdmin: 1 });

WebMediaSchema.index({ web: 1 });
WebMediaSchema.index({ category: 1 });
WebMediaSchema.index({ size: 1 });

PhoneSchema.index({ phone: 1 });

IconSchema.index({ name: 1 });

SocialSchema.index({ name: 1 });

// Create and export models
export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
export const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);
export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
export const Phone: Model<IPhone> =
  mongoose.models.Phone || mongoose.model<IPhone>("Phone", PhoneSchema);
export const Icon: Model<IIcon> =
  mongoose.models.Icon || mongoose.model<IIcon>("Icon", IconSchema);
export const Social: Model<ISocial> =
  mongoose.models.Social || mongoose.model<ISocial>("Social", SocialSchema);
export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export const Web: Model<IWeb> =
  mongoose.models.Web || mongoose.model<IWeb>("Web", WebSchema);
export const WebMedia: Model<IWebMedia> =
  mongoose.models.WebMedia ||
  mongoose.model<IWebMedia>("WebMedia", WebMediaSchema);

// Export all models as a single object for convenience
export const models = {
  Admin,
  Teacher,
  Student,
  Media,
  Phone,
  Icon,
  Social,
  Message,
  Web,
  WebMedia,
};

export default models;
