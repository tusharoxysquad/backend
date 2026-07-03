const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Attendance Tracker API',
      version: '1.0.0',
      description: 'Production-level SaaS Attendance Tracker — REST API Documentation',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local Development' },
      { url: 'https://admin-backend-1jyu.onrender.com', description: 'Production (Render)' },
      { url: 'https://oxysquad-staging.netlify.app', description: 'Staging (Netlify)' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── Generic ──────────────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Unauthorized access' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 100 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 10 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false },
              },
            },
          },
        },
        // ── Auth ─────────────────────────────────────────────────────────────
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', example: 'Password@123' },
          },
        },
        ChangePasswordBody: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'OldPass@123' },
            newPassword: { type: 'string', example: 'NewPass@456' },
          },
        },
        VerifyOtpBody: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            otp: { type: 'string', example: '482913', description: '6-digit code emailed to the user' },
          },
        },
        ResendOtpBody: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
          },
        },
        CreateUserBody: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'Password@123' },
            department: { type: 'string', example: 'Engineering' },
            designation: { type: 'string', example: 'Software Engineer' },
            reportingAdmin: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          },
        },
        UpdateUserBody: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            department: { type: 'string', example: 'Engineering' },
            designation: { type: 'string', example: 'Senior Engineer' },
            reportingAdmin: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          },
        },
        ResetPasswordBody: {
          type: 'object',
          required: ['newPassword'],
          properties: {
            newPassword: { type: 'string', example: 'NewPass@123' },
          },
        },
        // ── Leave ─────────────────────────────────────────────────────────────
        ApplyLeaveBody: {
          type: 'object',
          required: ['leaveType', 'session', 'fromDate', 'toDate', 'reason'],
          properties: {
            leaveType: { type: 'string', enum: ['EARNED', 'CASUAL', 'SICK', 'COMP_OFF'], example: 'CASUAL' },
            session: { type: 'string', enum: ['FULL_DAY', 'HALF_DAY'], example: 'FULL_DAY' },
            fromDate: { type: 'string', format: 'date', example: '2025-02-01' },
            toDate: { type: 'string', format: 'date', example: '2025-02-03' },
            reason: { type: 'string', example: 'Family function' },
          },
        },
        RejectBody: {
          type: 'object',
          required: ['rejectionReason'],
          properties: {
            rejectionReason: { type: 'string', example: 'Insufficient team coverage' },
          },
        },
        // ── Overtime ──────────────────────────────────────────────────────────
        OvertimeRequestBody: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', example: 'Critical release deployment' },
            date: { type: 'string', format: 'date', example: '2025-02-01' },
          },
        },
        // ── Holiday ───────────────────────────────────────────────────────────
        HolidayBody: {
          type: 'object',
          required: ['date', 'title', 'type'],
          properties: {
            date: { type: 'string', format: 'date', example: '2025-08-15' },
            title: { type: 'string', example: 'Independence Day' },
            type: { type: 'string', enum: ['National', 'Company', 'Optional'], example: 'National' },
          },
        },
        // ── Inquiry ───────────────────────────────────────────────────────────
        InquiryBody: {
          type: 'object',
          required: ['name', 'email', 'phone', 'companyName', 'serviceInterestedIn', 'projectTimeline', 'requirementType', 'projectDescription', 'agreeToContact'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@company.com' },
            phone: { type: 'string', example: '+123456789' },
            designation: { type: 'string', example: 'CTO' },
            companyName: { type: 'string', example: 'Acme Corp' },
            companyWebsite: { type: 'string', example: 'https://acme.com' },
            serviceInterestedIn: {
              type: 'string',
              enum: ['AI & Automation', 'Custom Software Development', 'Web Development', 'Mobile App Development', 'Data Analytics & BI', 'Cloud & DevOps', 'Digital Transformation', 'UI/UX Design', 'Dedicated Development Team', 'Other'],
              example: 'Custom Software Development',
            },
            serviceInterestedOther: { type: 'string', example: 'Cyber Security Solutions', description: 'Required when serviceInterestedIn is Other' },
            projectTimeline: {
              type: 'string',
              enum: ['Immediate', 'Within 1 Month', 'Within 3 Months', 'Within 6 Months', 'Exploring Options'],
              example: 'Within 3 Months',
            },
            requirementType: {
              type: 'string',
              enum: ['New Product Development', 'Existing Product Enhancement', 'Dedicated Team Hiring', 'AI Implementation', 'Digital Transformation', 'Support & Maintenance', 'Not Sure Yet'],
              example: 'New Product Development',
            },
            requirementTypeOther: { type: 'string', example: 'Custom requirement' },
            projectDescription: { type: 'string', maxLength: 3000, example: 'We need an AI-based SaaS platform for HR management.' },
            heardAboutUs: { type: 'string', example: 'LinkedIn', description: 'Google, LinkedIn, Referral, Social Media, Clutch, Existing Client, Other' },
            heardAboutUsOther: { type: 'string', example: 'Tech Conference', description: 'Required when heardAboutUs is Other' },
            agreeToContact: { type: 'boolean', example: true, description: 'Must be true' },
          },
        },
        // ── Insight ───────────────────────────────────────────────────────────
        InsightBody: {
          type: 'object',
          required: ['title', 'category', 'industry', 'summary'],
          properties: {
            title: { type: 'string', example: 'The Rise of AI in Healthcare' },
            category: { type: 'string', example: 'Technology' },
            industry: { type: 'string', example: 'Healthcare' },
            summary: { type: 'string', example: 'An in-depth look at how AI is transforming diagnostics.' },
            author: { type: 'string', example: 'John Doe' },
            publication_date: { type: 'string', format: 'date', example: '2025-01-15' },
            priority_level: { type: 'string', enum: ['High', 'Medium', 'Low'], example: 'High' },
            strategic_impact: { type: 'string', enum: ['High', 'Medium', 'Low'], example: 'High' },
            tags: { type: 'array', items: { type: 'string' }, example: ['AI', 'Healthcare'] },
            target_audience: { type: 'array', items: { type: 'string' }, example: ['CTO', 'Executives'] },
            key_takeaways: { type: 'array', items: { type: 'string' }, example: ['AI reduces errors by 40%'] },
            recommendations: { type: 'array', items: { type: 'string' }, example: ['Invest in AI training'] },
            future_predictions: { type: 'array', items: { type: 'string' }, example: ['AI handles 50% diagnoses by 2030'] },
            sections: {
              type: 'array',
              items: { type: 'object', properties: { heading: { type: 'string' }, content: { type: 'string' } } },
              example: [{ heading: 'Introduction', content: 'AI is reshaping healthcare.' }],
            },
            imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', description: 'Pass URL instead of file upload' },
          },
        },
        // ── Case Study / Our Work shared body ─────────────────────────────────
        CaseStudyBody: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'E-Commerce Platform Redesign' },
            clientName: { type: 'string', example: 'ShopEasy Inc.' },
            industry: { type: 'string', example: 'Retail' },
            year: { type: 'string', example: '2024' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'], example: 'published' },
            hero: {
              type: 'object',
              properties: {
                title: { type: 'string', example: 'Transforming Online Retail' },
                subtitle: { type: 'string', example: 'A complete UX overhaul' },
                description: { type: 'string', example: 'We redesigned the platform from the ground up.' },
                tags: { type: 'array', items: { type: 'string' }, example: ['E-Commerce', 'UX', 'React'] },
              },
            },
            overview: { type: 'object', example: { summary: 'Full platform redesign', duration: '6 months' } },
            brief: { type: 'object', example: { objective: 'Increase conversion rate by 25%' } },
            challenge: { type: 'object', example: { description: 'Legacy codebase and poor mobile UX' } },
            solution: { type: 'object', example: { description: 'Built a React-based PWA with optimized checkout' } },
            technologyStack: { type: 'array', items: { type: 'object' }, example: [{ name: 'React' }, { name: 'Node.js' }] },
            features: { type: 'array', items: { type: 'object' }, example: [{ title: 'One-click checkout', description: 'Reduced steps from 5 to 1' }] },
            results: { type: 'array', items: { type: 'object' }, example: [{ metric: 'Conversion Rate', value: '+28%' }] },
            testimonials: { type: 'array', items: { type: 'object' }, example: [{ author: 'Jane Smith', role: 'CEO', quote: 'Outstanding results!' }] },
            bannerImageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/banner.jpg', description: 'URL alternative to file upload' },
            logoUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/logo.png', description: 'URL alternative to file upload' },
            galleryUrls: { type: 'array', items: { type: 'string' }, example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'], description: 'Array of image URLs' },
          },
        },
      },
      // ── Reusable parameters ────────────────────────────────────────────────
      parameters: {
        PageParam: { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
        LimitParam: { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 }, description: 'Results per page' },
        SearchParam: { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search keyword' },
        SortParam: { in: 'query', name: 'sort', schema: { type: 'string' }, description: 'Field to sort by' },
        OrderParam: { in: 'query', name: 'order', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort order' },
      },
      // ── Reusable responses ─────────────────────────────────────────────────
      responses: {
        Unauthorized: {
          description: 'Unauthorized — JWT missing or invalid',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Forbidden: {
          description: 'Forbidden — Insufficient role',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        BadRequest: {
          description: 'Validation error',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
        Conflict: {
          description: 'Conflict — resource already exists or already in the target state',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user account' },
      { name: 'Super Admin', description: 'Super Admin user management' },
      { name: 'Admin', description: 'Admin team & leave management' },
      { name: 'Employee', description: 'Employee self-service' },
      { name: 'Attendance', description: 'Check-in / check-out & approvals' },
      { name: 'Leave', description: 'Leave applications & approvals' },
      { name: 'Overtime', description: 'Overtime requests & approvals' },
      { name: 'Dashboard', description: 'Role-based dashboard stats' },
      { name: 'Reports', description: 'Attendance & employee reports' },
      { name: 'Notifications', description: 'In-app notifications' },
      { name: 'Holidays', description: 'Holiday calendar management' },
      { name: 'Inquiries', description: 'Public contact form & inbox' },
      { name: 'Insights', description: 'Blog/insight articles' },
      { name: 'Case Studies', description: 'Client case study portfolio' },
      { name: 'Our Work', description: 'Portfolio of completed work' },
      { name: 'Profile', description: 'Authenticated user profile' },
    ],
  },
  apis: ['./src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
