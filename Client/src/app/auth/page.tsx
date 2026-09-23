"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import { getApiErrorMessage } from "../../api/axios";
import { sendOtp, verifyOtp } from "../../api/auth.api";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export default function AuthPage() {
  const theme = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleContinue = async () => {
    const normalizedPhone = normalizeDigits(phone).replace(/\s/g, "");

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("لطفاً یک شماره موبایل معتبر ۱۱ رقمی وارد کنید.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendOtp(normalizedPhone);
      setPhone(normalizedPhone);
      setOtpDigits(["", "", "", ""]);
      setStep("otp");
      setSuccess("کد تأیید به شماره شما ارسال شد.");
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    const currentCode = codeOverride ?? otpDigits.join("");
    const normalizedOtp = normalizeDigits(currentCode).replace(/\s/g, "");

    if (normalizedOtp.length !== 4) {
      setError("کد تأیید باید ۴ رقم باشد.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyOtp(phone, normalizedOtp);
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        throw new Error("توکن دسترسی دریافت نشد.");
      }

      window.localStorage.setItem("accessToken", accessToken);
      router.push("/builder");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = normalizeDigits(val).replace(/\D/g, "");
    if (!cleanVal) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 4).split("");
      const nextDigits = [...otpDigits];
      pasted.forEach((ch, idx) => {
        if (idx < 4) nextDigits[idx] = ch;
      });
      setOtpDigits(nextDigits);
      const nextFocus = Math.min(pasted.length, 3);
      otpInputsRef.current[nextFocus]?.focus();
      if (nextDigits.every((d) => d !== "")) {
        handleVerify(nextDigits.join(""));
      }
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanVal.slice(-1);
    setOtpDigits(nextDigits);

    if (index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 84px)",
        px: 2,
        py: { xs: 4, md: 6 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // گرادیانت ملایم بنفش از پایین به بالا (محو شونده در مرکز صفحه)
        background: `linear-gradient(to top, ${alpha(
          "#8B5CF6",
          0.12
        )} 0%, ${alpha("#6D28D9", 0.04)} 45%, transparent 100%)`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: "transparent",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.6),
          borderRadius: "8px",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.15rem",
              color: "text.primary",
              mb: 0.8,
            }}
          >
            {step === "phone" ? "ورود به حساب کاربری" : "تأیید کد امنیتی"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.85rem", lineHeight: 1.7 }}
          >
            {step === "phone"
              ? "جهت ورود یا ثبت‌نام، شماره موبایل خود را وارد نمایید."
              : `کد ۴ رقمی ارسال‌شده به شماره ${phone} را وارد کنید.`}
          </Typography>
        </Box>

        {step === "phone" ? (
          <Box sx={{ mt: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              value={phone}
              onChange={(e) => setPhone(normalizeDigits(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleContinue();
                }
              }}
              type="tel"
              autoComplete="tel"
              slotProps={{
                htmlInput: { inputMode: "tel" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneOutlinedIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  height: 44,
                  fontSize: "0.9rem",
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleContinue}
              disabled={!phone.trim() || isLoading}
              endIcon={<ArrowBackRoundedIcon sx={{mx:1}}/>}
              sx={{
                mt: 2,
                height: 42,
                
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.88rem",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              {isLoading ? "در حال پردازش..." : "مرحله بعد"}
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 3.5 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                direction: "ltr",
                mb: 2.5,
                justifyContent: "center",
              }}
            >
              {[0, 1, 2, 3].map((index) => (
                <TextField
                  key={index}
                  inputRef={(el) => (otpInputsRef.current[index] = el)}
                  value={otpDigits[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  type="text"
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      maxLength: 1,
                      style: {
                        textAlign: "center",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        padding: "8px 0",
                      },
                    },
                  }}
                  sx={{
                    width: 52,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      height: 52,
                      "&.Mui-focused fieldset": {
                        borderWidth: "1.5px",
                      },
                    },
                  }}
                />
              ))}
            </Stack>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => handleVerify()}
              disabled={otpDigits.some((d) => d === "") || isLoading}
              sx={{
                height: 42,
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.88rem",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              {isLoading ? "در حال تأیید..." : "ورود به سامانه"}
            </Button>

            <Button
              fullWidth
              variant="text"
              startIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setError(null);
                setSuccess(null);
                setStep("phone");
              }}
              sx={{
                mt: 1.5,
                height: 38,
                borderRadius: "6px",
                color: "text.secondary",
                fontSize: "0.8rem",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              تغییر شماره موبایل
            </Button>
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              borderRadius: "6px",
              fontSize: "0.8rem",
              py: 0.5,
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mt: 2,
              borderRadius: "6px",
              fontSize: "0.8rem",
              py: 0.5,
            }}
          >
            {success}
          </Alert>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 3,
            textAlign: "center",
            fontSize: "0.75rem",
            lineHeight: 1.6,
          }}
        >
          ورود شما به منزله پذیرش قوانین و مقررات سرویس است.
        </Typography>
      </Box>
    </Box>
  );
}