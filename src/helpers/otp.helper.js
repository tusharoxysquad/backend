const { sendOtpEmail } = require('./email.helper');

/**
 * Generate an OTP for a user, persist its hash, and email the plaintext code.
 * Used on login attempts for unverified accounts and resend-OTP flow.
 * @param {import('../models/User')} user - mongoose User document
 */
const issueAndSendOtp = async (user) => {
  const otp = await user.setOtp();
  await user.save({ validateBeforeSave: false });
  await sendOtpEmail(user.email, user.name, otp);
};

/**
 * Generate and persist an OTP but do NOT send any email.
 * Returns the plaintext OTP so the caller can embed it in a custom email.
 * Used during account creation so credentials + OTP arrive in one email.
 * @param {import('../models/User')} user - mongoose User document
 * @returns {Promise<string>} plaintext OTP
 */
const issueOtpOnly = async (user) => {
  const otp = await user.setOtp();
  await user.save({ validateBeforeSave: false });
  return otp;
};

module.exports = { issueAndSendOtp, issueOtpOnly };
