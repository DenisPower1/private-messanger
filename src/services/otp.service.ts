import Otp from "../models/otp.model";

export const validateOtp = async (email: string, otp: string) => {
  const user = await Otp.findOne({
    email: email,
  });

  if (user) {
    if (user.otp != otp) {
      const numberOfTries = user.tries - 1;

      if (numberOfTries == 0) {
        await Otp.deleteOne({ email: email });
      } else {
        await Otp.findOneAndUpdate(
          {
            email: email,
          },
          {
            tries: numberOfTries,
          },
        );
      }

      return {
        success: false,
      };
    } else {
      await Otp.deleteOne({ email: email });

      return {
        success: true,
      };
    }
  } else {
    return {
      success: false,
    };
  }
};

export const storeOtp = async (userEmail: string, otp: string) => {
  const otpRequestAlreadyExist = await Otp.findOne({ email: userEmail });

  if (otpRequestAlreadyExist) {
    return {
      success: false,
      message: "User already requested OTP, wait till the ongoing OTP expires",
    };
  } else {
    await Otp.insertOne({
      email: userEmail,
      otp: otp,
    });

    return {
      success: true,
      message: "Opt stored successfully it will expires in 4 minutes",
    };
  }
};
