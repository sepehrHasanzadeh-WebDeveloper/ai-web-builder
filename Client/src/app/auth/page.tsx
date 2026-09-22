"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import { getApiErrorMessage } from "../../api/axios";
import { sendOtp, verifyOtp } from "../../api/auth.api";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleContinue = async () => {
    const normalizedPhone = normalizeDigits(phone).replace(/\s/g, "");

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("لطفاً یک شماره موبایل معتبر وارد کنید.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendOtp(normalizedPhone);
      setPhone(normalizedPhone);
      setOtp("");
      setStep("otp");
      setSuccess("کد تأیید با موفقیت ارسال شد.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const normalizedOtp = normalizeDigits(otp).replace(/\s/g, "");

    if (normalizedOtp.length !== 4) {
      setError("کد تأیید باید چهار رقم باشد.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyOtp(phone, normalizedOtp);
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        throw new Error("توکن دسترسی از سرور دریافت نشد.");
      }

      window.localStorage.setItem("accessToken", accessToken);
      router.push("/builder");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
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
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(196, 181, 253, 0.24), transparent 30%), radial-gradient(circle at 85% 80%, rgba(224, 231, 255, 0.55), transparent 32%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 430,
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2.5,
              color: "primary.main",
              bgcolor: "rgba(79, 70, 229, 0.1)",
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {step === "phone" ? "ورود یا ثبت‌نام" : "تأیید شماره موبایل"}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>
            {step === "phone"
              ? "برای ورود به سایت‌ساز، شماره موبایل خود را وارد کنید."
              : `کد تأیید ارسال‌شده به ${phone} را وارد کنید.`}
          </Typography>
        </Box>

        {step === "phone" ? (
          <Box sx={{ mt: 4 }}>
            <TextField
              fullWidth
              label="شماره موبایل"
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              value={phone}
              onChange={(event) => setPhone(normalizeDigits(event.target.value))}
              type="tel"
              autoComplete="tel"
              slotProps={{
                htmlInput: { inputMode: "tel" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleContinue}
              disabled={!phone.trim() || isLoading}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                mt: 2,
                height: 48,
                background:
                  "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)",
                },
              }}
            >
              {isLoading ? "در حال ارسال..." : "ادامه"}
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            <TextField
              fullWidth
              label="کد تأیید"
              placeholder="------"
              value={otp}
              onChange={(event) =>
                setOtp(
                  normalizeDigits(event.target.value)
                    .replace(/\D/g, "")
                    .slice(0, 4),
                )
              }
              autoComplete="one-time-code"
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                  maxLength: 4,
                  style: {
                    direction: "ltr",
                    letterSpacing: "0.5em",
                    textAlign: "center",
                    fontWeight: 700,
                  },
                },
              }}
              helperText="کد ارسال‌شده را وارد کنید"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerify}
              disabled={otp.length !== 4 || isLoading}
              sx={{
                mt: 2,
                height: 48,
                background:
                  "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)",
                },
              }}
            >
              {isLoading ? "در حال بررسی..." : "تأیید و ورود"}
            </Button>

            <Button
              fullWidth
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => {
                setError(null);
                setSuccess(null);
                setStep("phone");
              }}
              sx={{ mt: 1.5, color: "text.secondary" }}
            >
              ویرایش شماره موبایل
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 3, textAlign: "center", lineHeight: 1.8 }}
        >
          با ورود یا ثبت‌نام، قوانین استفاده از سایت را می‌پذیرید.
        </Typography>
      </Paper>
    </Box>
  );
}
