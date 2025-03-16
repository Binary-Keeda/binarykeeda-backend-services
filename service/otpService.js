import { OTPModel } from "../models/OtpModel.js";

// Helper function to add OTP to the database
export const addOTPToDatabase = async (email, otp) => {
  try {
    // Set expiration time to 10 minutes from now
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10); // 10-minute expiry

    // Check if an OTP entry already exists for the given email
    const existingOtp = await OTPModel.findOne({ email });

    if (existingOtp) {
      // Update the existing OTP and expiration time
      await existingOtp.updateOne({ $set: { otp, expiresAt: expiration } });
    } else {
      // Create a new OTP entry
      const otpEntry = new OTPModel({
        email,
        otp,
        expiresAt: expiration,
      });
      await otpEntry.save();
    }
  } catch (error) {
    console.error('Error saving OTP to the database:', error.message);
    throw new Error('Failed to save OTP. Please try again.');
  }
};

// Helper function to get OTP from the database
export const getOTPFromDatabase = async (email) => {
  const otpEntry = await OTPModel.findOne({ email });

  if (!otpEntry || otpEntry.expiresAt < new Date()) {
    return null; // OTP is expired or not found
  }

  return otpEntry.otp;
};

// Helper function to delete OTP after it's used or expired
export const deleteOTPFromDatabase = async (email) => {
  await OTPModel.deleteOne({ email });
};
