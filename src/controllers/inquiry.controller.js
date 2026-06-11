const inquiryService = require('../services/inquiry.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const submitInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.submitInquiry(req.body);
  sendSuccess(res, 'Inquiry submitted successfully', inquiry, 201);
});

const getAllInquiries = asyncHandler(async (req, res) => {
  const { inquiries, pagination } = await inquiryService.getAllInquiries(req.query);
  sendPaginated(res, 'Inquiries fetched successfully', inquiries, pagination);
});

const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.getInquiryById(req.params.id);
  sendSuccess(res, 'Inquiry fetched successfully', inquiry);
});

const markAsRead = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.markAsRead(req.params.id);
  sendSuccess(res, 'Inquiry marked as read', inquiry);
});

const deleteInquiry = asyncHandler(async (req, res) => {
  await inquiryService.deleteInquiry(req.params.id);
  sendSuccess(res, 'Inquiry deleted successfully');
});

module.exports = { submitInquiry, getAllInquiries, getInquiryById, markAsRead, deleteInquiry };
