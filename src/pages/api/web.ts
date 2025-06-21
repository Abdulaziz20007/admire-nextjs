import { NextApiRequest, NextApiResponse } from 'next';
import { withDatabase, createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/db-utils';
import { Web, Teacher, Student, Media, Social, Phone } from '@/db/models';

/**
 * Public web data endpoint
 * POST /api/web - Get all data needed for the landing page
 * Requirements: User agent should be browser and refer url should be admirelc.uz
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(createErrorResponse('Method not allowed'));
  }

  try {
    // Check user agent and referer requirements
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';
    
    // Basic browser check (contains common browser identifiers)
    const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent);
    
    // Check if referer contains admirelc.uz (allow localhost for development)
    const isValidReferer = referer.includes('admirelc.uz') || 
                          referer.includes('localhost') || 
                          process.env.NODE_ENV === 'development';
    
    if (!isBrowser) {
      return res.status(403).json(createErrorResponse('Invalid user agent'));
    }
    
    if (!isValidReferer && process.env.NODE_ENV === 'production') {
      return res.status(403).json(createErrorResponse('Invalid referer'));
    }

    // Get web configuration
    const webConfig = await Web.findOne().populate([
      {
        path: 'header_media',
        model: 'Media'
      },
      {
        path: 'phones',
        model: 'Phone'
      }
    ]);

    if (!webConfig) {
      return res.status(404).json(createErrorResponse('Web configuration not found'));
    }

    // Get teachers with their associated data
    const teachers = await Teacher.find({ is_active: true })
      .populate('avatar', 'url alt_text')
      .sort({ order: 1 })
      .lean();

    // Get students with their associated data
    const students = await Student.find({ is_active: true })
      .populate('avatar', 'url alt_text')
      .sort({ order: 1 })
      .lean();

    // Get media items
    const mediaItems = await Media.find({ is_active: true })
      .sort({ order: 1 })
      .lean();

    // Get social media links
    const socialLinks = await Social.find({ is_active: true })
      .populate('icon', 'name url')
      .sort({ order: 1 })
      .lean();

    // Get contact phones
    const contactPhones = await Phone.find({ is_active: true })
      .sort({ order: 1 })
      .lean();

    // Prepare response data
    const responseData = {
      // Header section
      header: {
        title: webConfig.header_title,
        subtitle: webConfig.header_subtitle,
        description: webConfig.header_description,
        media: webConfig.header_media,
        cta_text: webConfig.header_cta_text,
        cta_link: webConfig.header_cta_link
      },
      
      // About section
      about: {
        title: webConfig.about_title,
        description: webConfig.about_description,
        stats: {
          students_count: webConfig.students_count,
          teachers_count: webConfig.teachers_count,
          courses_count: webConfig.courses_count,
          success_rate: webConfig.success_rate
        }
      },
      
      // Teachers section
      teachers: teachers.map(teacher => ({
        _id: teacher._id,
        name: teacher.name,
        surname: teacher.surname,
        position: teacher.position,
        bio: teacher.bio,
        experience_years: teacher.experience_years,
        specializations: teacher.specializations,
        avatar: teacher.avatar,
        is_featured: teacher.is_featured
      })),
      
      // Students section
      students: students.map(student => ({
        _id: student._id,
        name: student.name,
        surname: student.surname,
        course: student.course,
        level: student.level,
        testimonial: student.testimonial,
        avatar: student.avatar,
        achievement: student.achievement
      })),
      
      // Gallery/Media section
      media: mediaItems.map(item => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        url: item.url,
        type: item.type,
        size: item.size,
        alt_text: item.alt_text
      })),
      
      // Contact section
      contact: {
        address: webConfig.address,
        email: webConfig.email,
        phones: contactPhones,
        working_hours: webConfig.working_hours,
        location: {
          latitude: webConfig.latitude,
          longitude: webConfig.longitude
        }
      },
      
      // Social media
      social: socialLinks.map(social => ({
        _id: social._id,
        name: social.name,
        url: social.url,
        icon: social.icon
      })),
      
      // SEO data
      seo: {
        title: webConfig.meta_title,
        description: webConfig.meta_description,
        keywords: webConfig.meta_keywords
      }
    };

    return res.status(200).json(createSuccessResponse(
      responseData,
      'Web data retrieved successfully'
    ));
  } catch (error) {
    return handleApiError(error, res, 'Failed to retrieve web data');
  }
}

export default withDatabase(handler);
