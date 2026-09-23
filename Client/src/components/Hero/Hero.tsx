"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import DevicesIcon from "@mui/icons-material/Devices";
import Link from "next/link";

export default function Hero() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "transparent",
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
      }}
    >
      {/* هاله نوری گرادیانی بسیار ملایم در پشت متن (بدون رنگ صلب) */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: { xs: 280, md: 520 },
          height: { xs: 280, md: 400 },
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.14
          )} 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* محتوای اصلی */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* نشان (Badge) */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.8,
            py: 0.6,
            mb: 2.5,
            borderRadius: "50px",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            color: "primary.main",
            boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16 }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: "0.82rem",
              letterSpacing: "-0.2px",
            }}
          >
            نسل جدید ساخت وب‌سایت با هوش مصنوعی
          </Typography>
        </Box>

        {/* عنوان اصلی */}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "2.1rem", sm: "2.9rem", md: "3.5rem" },
            lineHeight: 1.25,
            color: "text.primary",
            mb: 2,
            letterSpacing: "-0.5px",
          }}
        >
          ایده‌تان را در چند ثانیه به{" "}
          <Box
            component="span"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            سایت واقعی
          </Box>{" "}
          تبدیل کنید
        </Typography>

        {/* توضیحات تکمیلی */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.95rem", sm: "1.08rem" },
            maxWidth: 580,
            mb: 3,
            lineHeight: 1.75,
          }}
        >
          بدون نیاز به کدنویسی، تنها با وارد کردن توضیحات کسب‌وکارتان، هوش
          مصنوعی قالبی اختصاصی، ریسپانسیو و بهینه برای شما می‌سازد.
        </Typography>

        {/* دکمه‌های اکشن */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            width: { xs: "100%", sm: "auto" },
            mb: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            component={Link}
            href="/builder"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowBackIcon sx={{ mr: 0.5 }} />}
            sx={{
              width: { xs: "100%", sm: "auto" },
              px: 3.5,
              py: 1.2,
              fontSize: "0.95rem",
              fontWeight: 700,
              borderRadius: "12px",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                boxShadow: `0 10px 24px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
              },
            }}
          >
            ساخت رایگان وب‌سایت
          </Button>

          <Button
            component={Link}
            href="/templates"
            variant="outlined"
            size="large"
            sx={{
              width: { xs: "100%", sm: "auto" },
              px: 3,
              py: 1.2,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: "12px",
              borderColor: alpha(theme.palette.divider, 0.9),
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            مشاهده نمونه‌کارها
          </Button>
        </Stack>

        {/* جزئیات تکمیلی و اعتمادسازی (Feature Badges / Proofs) */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 3 }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", sm: "block" }, height: 16, my: "auto" }}
            />
          }
          sx={{
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.35)}`,
            width: "100%",
            maxWidth: 620,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <BoltIcon sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              تحویل آنی در ۳۰ ثانیه
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <DevicesIcon sx={{ fontSize: 18, color: "info.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              ۱۰۰٪ واکنش‌گرا و سازگار با موبایل
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "success.main" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              بدون نیاز به کارت اعتباری
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
