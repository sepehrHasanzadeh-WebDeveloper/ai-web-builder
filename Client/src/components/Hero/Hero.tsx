"use client";

import React from "react";
import { Box, Container, Typography, Button, Stack, useTheme, alpha } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // برای دکمه در زبان فارسی (RTL)
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LaserFlow from "../LaserFlow";
import Link from "next/link";

export default function Hero() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        marginBottom:"25px",
        minHeight: { xs: "85vh", md: "90vh" },
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      {/* Background Laser Animation */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none", // جلوگیری از بلاک شدن کلیک‌ها و انتخاب متن
        }}
      >
        <LaserFlow
          color="#4F46E5"
          wispDensity={1}
          flowSpeed={0.35}
          verticalSizing={2}
          horizontalSizing={1}
          fogIntensity={0.45}
          fogScale={0.3}
          wispSpeed={15}
          wispIntensity={5}
          flowStrength={0.25}
          decay={1.1}
          horizontalBeamOffset={0}
          verticalBeamOffset={-0.5}
          backgroundColor="#F8FAFC"
          style={{ width: "100%", height: "100%" }}
        />
      </Box>

      {/* Foreground Content Layer */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Badge نمونه */}
       <Box
  sx={{
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    px: 1.5,
    py: 1.2,
    mb: 20,
    borderRadius: "50px",
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    color: "primary.main",
  }}
>
  <AutoAwesomeIcon sx={{ fontSize: 16 }} />
  <Typography
    variant="caption"
    sx={{
      fontWeight: 600,
      fontSize: "0.82rem",
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
            fontWeight: 800,
            fontSize: { xs: "2.2rem", sm: "3.2rem", md: "3.8rem" },
            lineHeight: 1.25,
            color: "text.primary",
            mb: 2.5,
          }}
        >
          ایده‌تان را در چند ثانیه به{" "}
          <Box
            component="span"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
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
            fontSize: { xs: "1rem", sm: "1.15rem" },
            maxWidth: 620,
            mb: 4,
            lineHeight: 1.8,
          }}
        >
          بدون نیاز به کدنویسی، تنها با وارد کردن توضیحات کسب‌وکارتان، هوش مصنوعی قالبی اختصاصی، ریسپانسیو و بهینه برای شما می‌سازد.
        </Typography>

        {/* دکمه‌های اکشن */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={5}
          sx={{ width: { xs: "100%", sm: "auto" , rowGap:10 } }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ArrowBackIcon />}
            sx={{
              marginLeft:"20px",
              px: 4,
              py: 1.4,
              fontSize: "1rem",
              borderRadius: "10px",
              boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <Link href={"/builder"}>
                ساخت رایگان وب‌سایت
            </Link>
          </Button>

          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 3.5,
              py: 1.4,
              fontSize: "1rem",
              borderRadius: "10px",
              borderColor: "divider",
              color: "text.primary",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(8px)",
              "&:hover": {
                borderColor: "text.secondary",
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            مشاهده نمونه‌کارها
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}