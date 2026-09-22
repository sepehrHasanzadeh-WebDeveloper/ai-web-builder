"use client";

import { useState } from "react";
import {
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

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleContinue = () => {
    if (!phone.trim()) return;
    setStep("otp");
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
              onChange={(event) => setPhone(event.target.value)}
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
              disabled={!phone.trim()}
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
              ادامه
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
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              autoComplete="one-time-code"
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                  maxLength: 6,
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
              disabled={otp.length !== 6}
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
              تأیید و ورود
            </Button>

            <Button
              fullWidth
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => setStep("phone")}
              sx={{ mt: 1.5, color: "text.secondary" }}
            >
              ویرایش شماره موبایل
            </Button>
          </Box>
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
