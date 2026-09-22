import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

interface SendOtpResponse {
  expiresInSeconds: number;
}

export interface VerifyOtpResponse {
  user: {
    id: string;
    phone: string;
  };
  accessToken: string;
  isNewUser: boolean;
}

export async function sendOtp(phone: string) {
  const response = await api.post<ApiResponse<SendOtpResponse>>(
    "/auth/send-otp",
    { phone },
  );

  return response.data;
}

export async function verifyOtp(phone: string, code: string) {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>(
    "/auth/verify-otp",
    { phone, code },
  );

  return response.data;
}
