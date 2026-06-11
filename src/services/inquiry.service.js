const Inquiry = require('../models/Inquiry');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const submitInquiry = async (data) => {
  const inquiry = await Inquiry.create(data);
  return inquiry;
};

const getAllInquiries = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ name: regex }, { email: regex }, { subject: regex }];
  }

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Inquiry.countDocuments(filter),
  ]);

  return { inquiries, pagination: buildPaginationMeta(total, page, limit) };
};

const getInquiryById = async (id) => {
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  return inquiry;
};

const markAsRead = async (id) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { status: 'READ' },
    { new: true }
  );
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
  return inquiry;
};

const deleteInquiry = async (id) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!inquiry) throw ApiError.notFound('Inquiry not found');
};

module.exports = { submitInquiry, getAllInquiries, getInquiryById, markAsRead, deleteInquiry };
