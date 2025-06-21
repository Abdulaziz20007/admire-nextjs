import { NextApiRequest, NextApiResponse } from "next";
import {
  withDatabase,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  sanitizeInput,
  validateRequiredFields,
} from "@/lib/db-utils";
import {
  withPermission,
  AuthenticatedRequest,
  PERMISSIONS,
} from "@/lib/auth-middleware";
import { Web } from "@/db/models";
import { IWeb, WebInput } from "@/types/database";

/**
 * Web content management endpoints
 * GET /api/admin/web - Get current web content (Content Access or higher)
 * PUT /api/admin/web - Update web content (Content Access or higher)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        return await getWebContent(req, res);
      case "PUT":
        return await updateWebContent(req, res);
      default:
        return res.status(405).json(createErrorResponse("Method not allowed"));
    }
  } catch (error) {
    return handleApiError(error, res, "Web content operation failed");
  }
}

/**
 * Get current web content
 */
async function getWebContent(req: AuthenticatedRequest, res: NextApiResponse) {
  // Get the first (and should be only) web content document
  let webContent = await Web.findOne()
    .populate("mainPhone", "phone")
    .populate("phones", "phone")
    .populate("socials", "name url")
    .populate({
      path: "socials",
      populate: {
        path: "icon",
        select: "name url",
      },
    })
    .populate("media")
    .lean();

  // If no web content exists, create initial content
  if (!webContent) {
    // First create a default phone number for mainPhone requirement
    const { Phone } = await import("@/db/models");
    const defaultPhone = new Phone({
      phone: "+998 90 123 45 67",
    });
    await defaultPhone.save();

    const initialWebContent = {
      // Header content
      headerImg: "/images/header-default.jpg",
      headerH1Uz: "Admire Education Center",
      headerH1En: "Admire Education Center",

      // About section
      aboutP1Uz: "Biz haqimizda ma'lumot",
      aboutP1En: "About us information",
      aboutP2Uz: "Qo'shimcha ma'lumot",
      aboutP2En: "Additional information",

      // Statistics
      totalStudents: 0,
      bestStudents: 0,
      totalTeachers: 0,

      // Gallery section
      galleryPUz: "Bizning rasmlar to'plami",
      galleryPEn: "Our photo collection",

      // Teachers section
      teachersPUz: "Bizning professional o'qituvchilar jamoasi",
      teachersPEn: "Our professional teaching team",

      // Students section
      studentsPUz: "Bizning talabalar haqida ma'lumot",
      studentsPEn: "Information about our students",

      // Contact information
      addressUz: "Manzil kiritilmagan",
      addressEn: "Address not provided",
      orientationUz: "Yo'nalish kiritilmagan",
      orientationEn: "Orientation not provided",
      workTime: "9:00 - 18:00",
      workTimeSunday: "Dam olish kuni",
      extendedAddressUz: "Batafsil manzil kiritilmagan",
      extendedAddressEn: "Extended address not provided",
      email: "info@admire.uz",
      mainPhone: defaultPhone._id,

      // Footer
      footerPUz: "Admire Education Center - Sifatli ta'lim markazi",
      footerPEn: "Admire Education Center - Quality education center",

      // Relations (empty arrays for now)
      phones: [defaultPhone._id],
      teachers: [],
      students: [],
      media: [],
      socials: [],
    };

    try {
      const newWebContent = new Web(initialWebContent);
      await newWebContent.save();

      // Fetch the newly created content with populated fields
      webContent = await Web.findById(newWebContent._id)
        .populate("mainPhone", "phone")
        .populate("phones", "phone")
        .populate("socials", "name url")
        .populate({
          path: "socials",
          populate: {
            path: "icon",
            select: "name url",
          },
        })
        .populate("media")
        .lean();

      console.log("✅ Initial web content created successfully");
    } catch (error) {
      console.error("❌ Failed to create initial web content:", error);
      return res
        .status(500)
        .json(createErrorResponse("Failed to create initial web content"));
    }
  }

  return res
    .status(200)
    .json(
      createSuccessResponse(webContent, "Web content retrieved successfully")
    );
}

/**
 * Update web content
 */
async function updateWebContent(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const updateData = sanitizeInput(req.body) as Partial<WebInput>;

  // Remove fields that shouldn't be updated directly
  delete (updateData as any)._id;
  delete (updateData as any).createdAt;
  delete (updateData as any).updatedAt;

  // Validate required fields for critical content
  const requiredFields = [
    "headerH1Uz",
    "headerH1En",
    "aboutP1Uz",
    "aboutP1En",
    "email",
  ];
  const missingFields = validateRequiredFields(updateData, requiredFields);
  if (missingFields.length > 0) {
    return res
      .status(400)
      .json(
        createErrorResponse(
          `Missing required fields: ${missingFields.join(", ")}`
        )
      );
  }

  // Validate email format if provided
  if (updateData.email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(updateData.email)) {
      return res.status(400).json(createErrorResponse("Invalid email format"));
    }
  }

  // Validate numeric fields
  if (updateData.totalStudents !== undefined && updateData.totalStudents < 0) {
    return res
      .status(400)
      .json(createErrorResponse("Total students cannot be negative"));
  }
  if (updateData.bestStudents !== undefined && updateData.bestStudents < 0) {
    return res
      .status(400)
      .json(createErrorResponse("Best students cannot be negative"));
  }
  if (updateData.totalTeachers !== undefined && updateData.totalTeachers < 0) {
    return res
      .status(400)
      .json(createErrorResponse("Total teachers cannot be negative"));
  }

  // Get existing web content or create new one
  let webContent = await Web.findOne();

  if (!webContent) {
    // Create new web content if none exists
    webContent = new Web(updateData);
    await webContent.save();
  } else {
    // Update existing content
    Object.assign(webContent, updateData);
    await webContent.save();
  }

  // Populate the response
  const populatedContent = await Web.findById(webContent._id)
    .populate("mainPhone", "phone")
    .populate("phones", "phone")
    .populate("socials", "name url")
    .populate({
      path: "socials",
      populate: {
        path: "icon",
        select: "name url",
      },
    })
    .populate("media")
    .lean();

  return res
    .status(200)
    .json(
      createSuccessResponse(
        populatedContent,
        "Web content updated successfully"
      )
    );
}

export default withDatabase(
  withPermission(PERMISSIONS.CONTENT_ACCESS)(handler)
);
