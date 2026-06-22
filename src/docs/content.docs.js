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
 */
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
 *     summary: Create insight (Admin+) — supports file upload or imageUrl
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/InsightBody'
 *               - type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                     format: binary
 *                     description: Image file (optional — use imageUrl if sending a URL instead)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsightBody'
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
 *             allOf:
 *               - $ref: '#/components/schemas/InsightBody'
 *               - type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                     format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsightBody'
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
 *     summary: Create case study (Admin+) — supports file upload or URL fields
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CaseStudyBody'
 *               - type: object
 *                 properties:
 *                   bannerImage:
 *                     type: string
 *                     format: binary
 *                     description: Banner image file (or use bannerImageUrl)
 *                   logo:
 *                     type: string
 *                     format: binary
 *                     description: Logo file (or use logoUrl)
 *                   gallery:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *                     description: Gallery images (max 10, or use galleryUrls)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyBody'
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
 *             allOf:
 *               - $ref: '#/components/schemas/CaseStudyBody'
 *               - type: object
 *                 properties:
 *                   bannerImage:
 *                     type: string
 *                     format: binary
 *                   logo:
 *                     type: string
 *                     format: binary
 *                   gallery:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyBody'
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
 *     summary: Create work item (Admin+) — supports file upload or URL fields
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CaseStudyBody'
 *               - type: object
 *                 properties:
 *                   bannerImage:
 *                     type: string
 *                     format: binary
 *                     description: Banner image file (or use bannerImageUrl)
 *                   logo:
 *                     type: string
 *                     format: binary
 *                     description: Logo file (or use logoUrl)
 *                   gallery:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *                     description: Gallery images (max 10, or use galleryUrls)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyBody'
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
 *             allOf:
 *               - $ref: '#/components/schemas/CaseStudyBody'
 *               - type: object
 *                 properties:
 *                   bannerImage:
 *                     type: string
 *                     format: binary
 *                   logo:
 *                     type: string
 *                     format: binary
 *                   gallery:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseStudyBody'
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
