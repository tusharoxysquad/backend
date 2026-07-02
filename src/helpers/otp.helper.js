const { sendOtpEmail } = require('./email.helper');

/**
 * Generate an OTP for a user, persist its hash, and email the plaintext code
 * @param {import('../models/User')} user - mongoose User document
 */
const issueAndSendOtp = async (user) => {
  const otp = await user.setOtp();
  await user.save({ validateBeforeSave: false });
  await sendOtpEmail(user.email, user.name, otp);
};

module.exports = { issueAndSendOtp };
