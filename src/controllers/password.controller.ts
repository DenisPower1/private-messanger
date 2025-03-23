import validator from 'validator';
import { validateOtp, storeOtp } from '../services/otp.service.js';
import { Request, Response } from 'express';
import { sendOTPCodeEmail } from '../utils/emailSender.js';
import * as User from '../services/user.service.js';
import { generateSixRandomDigits } from '../utils/helpers.js';

export const checkOtp = async (req: Request, resp: Response) => {
  const { email, otp } = req.body;

  const isNotEmail = !validator.isEmail(email);
  const normalizedEmail = validator.normalizeEmail(email) || '';

  if (isNotEmail) {
    resp.status(400).json({
      success: false,
      message: 'Invalid e-mail provided',
    });
  } else {
    const otpValidation = await validateOtp(normalizedEmail, otp);
    const user = await User.findByEmail(email);

    if (otpValidation.success) {
      resp.status(200).json({
        success: true,
        message: `Your password is ${user?.password}, store it safely`,
      });
    } else {
      resp.status(500).json({
        success: false,
        message:
          'Something went wrong, the entered opt is probably invalid, remember you only have 3 tries',
      });
    }
  }
};

export const sendOpt = async (req: Request, resp: Response) => {
  const { email } = req.body;
  const isNotEmail = !validator.isEmail(email);
  const normalizedEmail = validator.normalizeEmail(email) || '';
  if (isNotEmail) {
    resp.status(400).json({
      success: false,
      message: 'Invalid e-mail provided',
    });
  } else {
    const generatedOpt = generateSixRandomDigits();
    const storeOptAnswer = await storeOtp(email, generatedOpt);
    if (storeOptAnswer.success) {
      sendOTPCodeEmail(normalizedEmail, generatedOpt);
      resp.status(200).json({
        success: true,
        message: `A number of 6 digits was sent to your email, it will expires in 4 minutes`,
      });
    } else {
      resp.status(403).json(storeOptAnswer);
    }
  }
};
