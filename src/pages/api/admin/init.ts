import { NextApiRequest, NextApiResponse } from "next";
import {
  withDatabase,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from "@/lib/db-utils";
import {
  withPermission,
  AuthenticatedRequest,
  PERMISSIONS,
} from "@/lib/auth-middleware";
import {
  Web,
  Teacher,
  Student,
  Media,
  Phone,
  Icon,
  Social,
  WebMedia,
} from "@/db/models";
import { MediaSize } from "@/types/database";
import { initializationData } from "@/data/init-data";

/**
 * Database initialization endpoint
 * POST /api/admin/init - Initialize database with pre-stored data (Full Access required)
 * No request body required - uses pre-stored initialization data
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(createErrorResponse("Method not allowed"));
  }

  try {
    // Use pre-stored initialization data
    const {
      Web: webData,
      Teacher: teacherData,
      Student: studentData,
    } = initializationData;

    // Check if database is already initialized
    const existingWeb = await Web.findOne();
    if (existingWeb) {
      return res
        .status(409)
        .json(createErrorResponse("Database is already initialized"));
    }

    const webConfig = webData[0];
    const results = {
      web: null as any,
      teachers: [] as any[],
      students: [] as any[],
      phones: [] as any[],
      icons: [] as any[],
      socials: [] as any[],
      media: [] as any[],
      webMedia: [] as any[],
    };

    // 1. Create phones
    const phonePromises = webConfig.phones.map(async (phoneNumber: string) => {
      const phone = new Phone({ phone: phoneNumber });
      await phone.save();
      return phone;
    });
    results.phones = await Promise.all(phonePromises);

    // 2. Create icons for socials
    const iconPromises = webConfig.socials.map(async (social: any) => {
      const icon = new Icon({
        name: social.name,
        url: social.icon_url,
      });
      await icon.save();
      return icon;
    });
    results.icons = await Promise.all(iconPromises);

    // 3. Create socials
    const socialPromises = webConfig.socials.map(
      async (socialData: any, index: number) => {
        const social = new Social({
          icon: results.icons[index]._id,
          name: socialData.name,
          url: socialData.url,
        });
        await social.save();
        return social;
      }
    );
    results.socials = await Promise.all(socialPromises);

    // 4. Create teachers
    if (teacherData.length > 0) {
      const teacherPromises = teacherData.map(async (teacher: any) => {
        const newTeacher = new Teacher({
          name: teacher.name,
          surname: teacher.surname,
          about: teacher.about,
          quote: teacher.quote,
          image: teacher.image,
          overall: teacher.overall,
          listening: teacher.listening,
          reading: teacher.reading,
          writing: teacher.writing,
          speaking: teacher.speaking,
          cefr: teacher.cefr,
          experience: teacher.experience,
          students: teacher.students,
        });
        await newTeacher.save();
        return newTeacher;
      });
      results.teachers = await Promise.all(teacherPromises);
    }

    // 5. Create students
    if (studentData.length > 0) {
      const studentPromises = studentData.map(async (student: any) => {
        const newStudent = new Student({
          name: student.name,
          surname: student.surname,
          image: student.image,
          certificate: student.certificate,
          overall: student.overall,
          listening: student.listening,
          reading: student.reading,
          writing: student.writing,
          speaking: student.speaking,
          cefr: student.cefr,
          comment: student.comment,
        });
        await newStudent.save();
        return newStudent;
      });
      results.students = await Promise.all(studentPromises);
    }

    // 6. Create media for gallery
    const mediaPromises = webConfig.gallery.map(async (galleryItem: any) => {
      const media = new Media({
        name: galleryItem.title,
        type: false, // false for image
        url: galleryItem.url,
      });
      await media.save();
      return media;
    });
    results.media = await Promise.all(mediaPromises);

    // 7. Create web configuration
    const web = new Web({
      headerImg: webConfig.header_img,
      headerH1Uz: webConfig.header_h1_uz,
      headerH1En: webConfig.header_h1_en,
      aboutP1Uz: webConfig.about_p1_uz,
      aboutP1En: webConfig.about_p1_en,
      aboutP2Uz: webConfig.about_p2_uz,
      aboutP2En: webConfig.about_p2_en,
      totalStudents: webConfig.total_students,
      bestStudents: webConfig.best_students,
      totalTeachers: webConfig.total_teachers,
      galleryPUz: webConfig.gallery_p_uz,
      galleryPEn: webConfig.gallery_p_en,
      teachersPUz: webConfig.teachers_p_uz,
      teachersPEn: webConfig.teachers_p_en,
      studentsPUz:
        webConfig.students_p_uz || "Bizning talabalarimiz bilan tanishing",
      studentsPEn: webConfig.students_p_en,
      addressUz: webConfig.address_uz,
      addressEn: webConfig.address_en,
      orientationUz: webConfig.orientation_uz,
      orientationEn: webConfig.orientation_en,
      workTime: webConfig.work_time,
      workTimeSunday: webConfig.work_time_sunday,
      extendedAddressUz: webConfig.extended_address_uz,
      extendedAddressEn: webConfig.extended_address_en,
      email: webConfig.email,
      mainPhone: results.phones[0]._id,
      footerPUz: webConfig.footer_p_uz,
      footerPEn: webConfig.footer_p_en,
      phones: results.phones.map((phone) => phone._id),
      teachers: results.teachers.map((teacher) => teacher._id),
      students: results.students.map((student) => student._id),
      socials: results.socials.map((social) => social._id),
    });
    await web.save();
    results.web = web;

    // 8. Create web media (gallery items)
    const webMediaPromises = webConfig.gallery.map(
      async (galleryItem: any, index: number) => {
        const webMedia = new WebMedia({
          alt: galleryItem.alt,
          title: galleryItem.title,
          category: galleryItem.category,
          size: galleryItem.size as MediaSize,
          web: web._id,
          media: results.media[index]._id,
        });
        await webMedia.save();
        return webMedia;
      }
    );
    results.webMedia = await Promise.all(webMediaPromises);

    // 9. Update web with media references
    web.media = results.webMedia.map((webMedia) => webMedia._id);
    await web.save();

    return res.status(201).json(
      createSuccessResponse(
        {
          message: "Database initialized successfully with pre-stored data",
          summary: {
            web: 1,
            teachers: results.teachers.length,
            students: results.students.length,
            phones: results.phones.length,
            icons: results.icons.length,
            socials: results.socials.length,
            media: results.media.length,
            webMedia: results.webMedia.length,
          },
        },
        "Database initialization completed"
      )
    );
  } catch (error) {
    return handleApiError(error, res, "Database initialization failed");
  }
}

export default withDatabase(withPermission(PERMISSIONS.FULL_ACCESS)(handler));
