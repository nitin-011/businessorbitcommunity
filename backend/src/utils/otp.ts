export interface OTPGenerateOptions {
  length?: number;
  numericOnly?: boolean;
}

export const generateOTP = (options: OTPGenerateOptions = {}): string => {
  const length = options.length || 6;
  const numericOnly = options.numericOnly ?? true;

  if (numericOnly) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

export const isOTPExpired = (otpExpiry: Date): boolean => {
  return new Date() > otpExpiry;
};
