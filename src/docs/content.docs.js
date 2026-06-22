/**
 * @swagger
 * /api/v1/inquiries:
 *   post:
 *     tags: [Inquiries]
 *     summary: Submit a public inquiry (rate limited — 5/hr per IP)
 *     description: Accepts multipart/form-data. All text fields plus an optional document file (PDF, DOC, DOCX, PPT, PPTX — max 20 MB).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - companyName
 *               - serviceInterestedIn
 *               - projectTimeline
 *               - requirementType
 *               - projectDescription
 *               - agreeToContact
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@company.com
 *               phone:
 *                 type: string
 *                 example: '+123456789'
 *               designation:
 *                 type: string
 *                 example: CTO
 *               companyName:
 *                 type: string
 *                 example: Acme Corp
 *               companyWebsite:
 *                 type: string
 *                 example: 'https://acme.com'
 *               serviceInterestedIn:
 *                 type: string
 *                 enum:
 *                   - AI & Automation
 *                   - Custom Software Development
 *                   - Web Development
 *                   - Mobile App Development
 *                   - Data Analytics & BI
 *                   - Cloud & DevOps
 *                   - Digital Transformation
 *                   - UI/UX Design
 *                   - Dedicated Development Team
 *                   - Other
 *                 example: Custom Software Development
 *               serviceInterestedOther:
 *                 type: string
 *                 example: Cyber Security Solutions
 *                 description: Required when serviceInterestedIn is Other
 *               projectTimeline:
 *                 type: string
 *                 enum:
 *                   - Immediate
 *                   - Within 1 Month
 *                   - Within 3 Months
 *                   - Within 6 Months
 *                   - Exploring Options
 *                 example: Within 3 Months
 *               requirementType:
 *                 type: string
 *                 enum:
 *                   - New Product Development
 *                   - Existing Product Enhancement
 *                   - Dedicated Team Hiring
 *                   - AI Implementation
 *                   - Digital Transformation
 *                   - Support & Maintenance
 *                   - Not Sure Yet
 *                 example: New Product Development
 *               requirementTypeOther:
 *                 type: string
 *                 example: Custom requirement
 *               projectDescription:
 *                 type: string
 *                 maxLength: 3000
 *                 example: We need an AI-based SaaS platform.
 *               heardAboutUs:
 *                 type: string
 *                 example: LinkedIn
 *                 description: 'Google, LinkedIn, Referral, Social Media, Clutch, Existing Client, Other'
 *               heardAboutUsOther:
 *                 type: string
 *                 example: Tech Conference
 *                 description: Required when heardAboutUs is Other
 *               agreeToContact:
 *                 type: boolean
 *                 example: true
 *                 description: Must be true
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: 'Optional requirements document (PDF, DOC, DOCX, PPT, PPTX — max 20 MB)'
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Inquiry submitted successfully
 *               data:
 *                 _id: 64f1a2b3c4d5e6f7a8b9c0d1
 *                 name: John Doe
 *                 email: john@company.com
 *                 companyName: Acme Corp
 *                 serviceInterestedIn: Custom Software Development
 *                 projectTimeline: Within 3 Months
 *                 requirementType: New Product Development
 *                 status: UNREAD
 *                 document:
 *                   fileName: abc123.pdf
 *                   originalName: requirements.pdf
 *                   fileUrl: 'https://res.cloudinary.com/demo/raw/upload/inquiries/documents/abc123.pdf'
 *                   fileSize: 204800
 *                   mimeType: application/pdf
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags: [Inquiries]
 *     summary: Get all inquiries (Super Admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UNREAD, READ]
 *         description: Filter by read status
 *       - in: query
 *         name: serviceInterestedIn
 *         schema:
 *           type: string
 *         description: Filter by service type
 *     responses:
 *       200:
 *         description: Inquiries list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/inquiries/{id}:
 *   get:
 *     tags: [Inquiries]
 *     summary: Get inquiry by ID (Super Admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inquiry data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Inquiries]
 *     summary: Soft delete inquiry (Super Admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inquiry deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/v1/inquiries/{id}/read:
 *   patch:
 *     tags: [Inquiries]
 *     summary: Mark inquiry as read (Super Admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inquiry marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/v1/insights:
 *   get:
 *     tags: [Insights]
 *     summary: Get all insights (Public)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: priority_level
 *         schema:
 *           type: string
 *           enum: [High, Medium, Low]
 *     responses:
 *       200:
 *         description: Insights list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *   post:
 *     tags: [Insights]
 *     summary: Create insight (Admin+)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, category, industry, summary]
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Rise of AI in Healthcare
 *               category:
 *                 type: string
 *                 example: Technology
 *               industry:
 *                 type: string
 *                 example: Healthcare
 *               summary:
 *                 type: string
 *                 example: An in-depth look at how AI is transforming diagnostics.
 *               author:
 *                 type: string
 *                 example: John Doe
 *               publication_date:
 *                 type: string
 *                 format: date
 *                 example: '2025-01-15'
 *               priority_level:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *                 example: High
 *               strategic_impact:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *                 example: High
 *               tags:
 *                 type: string
 *                 example: '["AI", "Healthcare"]'
 *                 description: JSON stringified array
 *               target_audience:
 *                 type: string
 *                 example: '["CTO", "Executives"]'
 *                 description: JSON stringified array
 *               key_takeaways:
 *                 type: string
 *                 example: '["AI reduces errors by 40%"]'
 *                 description: JSON stringified array
 *               recommendations:
 *                 type: string
 *                 example: '["Invest in AI training"]'
 *                 description: JSON stringified array
 *               future_predictions:
 *                 type: string
 *                 example: '["AI handles 50% diagnoses by 2030"]'
 *                 description: JSON stringified array
 *               sections:
 *                 type: string
 *                 example: '[{"heading":"Introduction","content":"AI is reshaping healthcare."}]'
 *                 description: JSON stringified array
 *               imageUrl:
 *                 type: string
 *                 example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
 *                 description: URL alternative to file upload
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (optional — use imageUrl instead if sending a URL)
 *     responses:
 *       201:
 *         description: Insight created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/insights/{id}:
 *   get:
 *     tags: [Insights]
 *     summary: Get insight by ID (Public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insight data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [Insights]
 *     summary: Update insight (Admin+)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               industry:
 *                 type: string
 *               summary:
 *                 type: string
 *               author:
 *                 type: string
 *               publication_date:
 *                 type: string
 *                 format: date
 *               priority_level:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *               strategic_impact:
 *                 type: string
 *                 enum: [High, Medium, Low]
 *               tags:
 *                 type: string
 *                 description: JSON stringified array
 *               sections:
 *                 type: string
 *                 description: JSON stringified array
 *               imageUrl:
 *                 type: string
 *                 description: URL alternative to file upload
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Insight updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Insights]
 *     summary: Delete insight (Admin+)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insight deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/v1/case-studies:
 *   get:
 *     tags: [Case Studies]
 *     summary: Get all case studies (Public)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *           example: '2024'
 *     responses:
 *       200:
 *         description: Case studies list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *   post:
 *     tags: [Case Studies]
 *     summary: Create case study (Admin+)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: E-Commerce Platform Redesign
 *               clientName:
 *                 type: string
 *                 example: ShopEasy Inc.
 *               industry:
 *                 type: string
 *                 example: Retail
 *               year:
 *                 type: string
 *                 example: '2024'
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 example: published
 *               hero:
 *                 type: string
 *                 example: '{"title":"Transforming Online Retail","subtitle":"A complete UX overhaul","description":"We redesigned the platform.","tags":["E-Commerce","UX","React"]}'
 *                 description: JSON stringified object
 *               overview:
 *                 type: string
 *                 example: '{"summary":"Full platform redesign","duration":"6 months"}'
 *                 description: JSON stringified object
 *               brief:
 *                 type: string
 *                 example: '{"objective":"Increase conversion rate by 25%"}'
 *                 description: JSON stringified object
 *               challenge:
 *                 type: string
 *                 example: '{"description":"Legacy codebase and poor mobile UX"}'
 *                 description: JSON stringified object
 *               solution:
 *                 type: string
 *                 example: '{"description":"Built a React-based PWA"}'
 *                 description: JSON stringified object
 *               technologyStack:
 *                 type: string
 *                 example: '[{"name":"React"},{"name":"Node.js"}]'
 *                 description: JSON stringified array
 *               features:
 *                 type: string
 *                 example: '[{"title":"One-click checkout"}]'
 *                 description: JSON stringified array
 *               results:
 *                 type: string
 *                 example: '[{"metric":"Conversion Rate","value":"+28%"}]'
 *                 description: JSON stringified array
 *               testimonials:
 *                 type: string
 *                 example: '[{"author":"Jane Smith","quote":"Outstanding!"}]'
 *                 description: JSON stringified array
 *               bannerImageUrl:
 *                 type: string
 *                 example: 'https://res.cloudinary.com/demo/image/upload/banner.jpg'
 *                 description: URL alternative to file upload
 *               logoUrl:
 *                 type: string
 *                 example: 'https://res.cloudinary.com/demo/image/upload/logo.png'
 *                 description: URL alternative to file upload
 *               galleryUrls:
 *                 type: string
 *                 example: '["https://example.com/img1.jpg"]'
 *                 description: JSON stringified array of URLs
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file (or use bannerImageUrl)
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo file (or use logoUrl)
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Gallery images max 10 (or use galleryUrls)
 *     responses:
 *       201:
 *         description: Case study created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/case-studies/{id}:
 *   get:
 *     tags: [Case Studies]
 *     summary: Get case study by ID (Public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Case study data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [Case Studies]
 *     summary: Update case study (Admin+)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               clientName:
 *                 type: string
 *               industry:
 *                 type: string
 *               year:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               hero:
 *                 type: string
 *                 description: JSON stringified object
 *               overview:
 *                 type: string
 *                 description: JSON stringified object
 *               technologyStack:
 *                 type: string
 *                 description: JSON stringified array
 *               features:
 *                 type: string
 *                 description: JSON stringified array
 *               results:
 *                 type: string
 *                 description: JSON stringified array
 *               bannerImageUrl:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               galleryUrls:
 *                 type: string
 *                 description: JSON stringified array of URLs
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Case study updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Case Studies]
 *     summary: Delete case study (Admin+)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Case study deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/v1/our-work:
 *   get:
 *     tags: [Our Work]
 *     summary: Get all work items (Public)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Work items list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *   post:
 *     tags: [Our Work]
 *     summary: Create work item (Admin+)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mobile Banking App
 *               clientName:
 *                 type: string
 *                 example: FinTrust Bank
 *               industry:
 *                 type: string
 *                 example: Finance
 *               year:
 *                 type: string
 *                 example: '2024'
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 example: published
 *               hero:
 *                 type: string
 *                 example: '{"title":"Banking in Your Pocket","subtitle":"Modern mobile-first","description":"Built for 500k+ users.","tags":["FinTech","Mobile"]}'
 *                 description: JSON stringified object
 *               overview:
 *                 type: string
 *                 example: '{"summary":"Mobile banking app","duration":"8 months"}'
 *                 description: JSON stringified object
 *               brief:
 *                 type: string
 *                 description: JSON stringified object
 *               challenge:
 *                 type: string
 *                 description: JSON stringified object
 *               solution:
 *                 type: string
 *                 description: JSON stringified object
 *               technologyStack:
 *                 type: string
 *                 example: '[{"name":"React Native"},{"name":"AWS"}]'
 *                 description: JSON stringified array
 *               features:
 *                 type: string
 *                 description: JSON stringified array
 *               results:
 *                 type: string
 *                 example: '[{"metric":"App Rating","value":"4.8/5"}]'
 *                 description: JSON stringified array
 *               testimonials:
 *                 type: string
 *                 description: JSON stringified array
 *               bannerImageUrl:
 *                 type: string
 *                 example: 'https://res.cloudinary.com/demo/image/upload/banner.jpg'
 *                 description: URL alternative to file upload
 *               logoUrl:
 *                 type: string
 *                 example: 'https://res.cloudinary.com/demo/image/upload/logo.png'
 *                 description: URL alternative to file upload
 *               galleryUrls:
 *                 type: string
 *                 example: '["https://example.com/img1.jpg"]'
 *                 description: JSON stringified array of URLs
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file (or use bannerImageUrl)
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo file (or use logoUrl)
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Gallery images max 10 (or use galleryUrls)
 *     responses:
 *       201:
 *         description: Work item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/v1/our-work/{id}:
 *   get:
 *     tags: [Our Work]
 *     summary: Get work item by ID (Public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work item data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [Our Work]
 *     summary: Update work item (Admin+)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               clientName:
 *                 type: string
 *               industry:
 *                 type: string
 *               year:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               hero:
 *                 type: string
 *                 description: JSON stringified object
 *               overview:
 *                 type: string
 *                 description: JSON stringified object
 *               technologyStack:
 *                 type: string
 *                 description: JSON stringified array
 *               features:
 *                 type: string
 *                 description: JSON stringified array
 *               results:
 *                 type: string
 *                 description: JSON stringified array
 *               bannerImageUrl:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               galleryUrls:
 *                 type: string
 *                 description: JSON stringified array of URLs
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Work item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Our Work]
 *     summary: Delete work item (Admin+)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work item deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
