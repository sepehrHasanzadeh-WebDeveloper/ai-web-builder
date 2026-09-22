"use client";

import { useState } from "react";
import Script from "next/script";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LaptopMacOutlinedIcon from "@mui/icons-material/LaptopMacOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TabletMacOutlinedIcon from "@mui/icons-material/TabletMacOutlined";
import { useBuilderChat } from "../contexts/BuilderChatContext";

type PreviewMode = "mobile" | "tablet" | "laptop";

const previewModes: Array<{
  value: PreviewMode;
  label: string;
  icon: typeof SmartphoneOutlinedIcon;
}> = [
  {
    value: "mobile",
    label: "موبایل",
    icon: SmartphoneOutlinedIcon,
  },
  {
    value: "tablet",
    label: "تبلت",
    icon: TabletMacOutlinedIcon,
  },
  {
    value: "laptop",
    label: "لپ‌تاپ",
    icon: LaptopMacOutlinedIcon,
  },
];

const previewWidths: Record<PreviewMode, number | string> = {
  mobile: 390,
  tablet: 768,
  laptop: "100%",
};

export default function BuilderPreview() {
  const [activeMode, setActiveMode] = useState<PreviewMode>("laptop");
  const { generatedSections, isLoading } = useBuilderChat();
  const activeModeLabel =
    previewModes.find((mode) => mode.value === activeMode)?.label ?? "";
  const orderedSections = [...generatedSections].sort(
    (first, second) => first.orderIndex - second.orderIndex,
  );

  return (
    <>
      {/* کلاس‌های Tailwind تولیدشده توسط AI در زمان build قابل اسکن نیستند. */}
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="afterInteractive"
      />

      <Paper
        elevation={0}
        sx={{
          height: "100%",
          minHeight: 0,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >

      <Box
        sx={{
          position: "relative",
          minHeight: 68,
          px: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Export */}
        <Tooltip title="خروجی گرفتن">
          <IconButton
            aria-label="خروجی گرفتن"
            sx={{
              position: "absolute",
              left: 12,
              color: "text.secondary",
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <FileDownloadOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Typography
          sx={{
            position: "absolute",
            right: 16,
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          Website Preview
        </Typography>

        {/* Responsive preview modes */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            direction: "ltr",
          }}
        >
          {previewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.value;

            return (
              <Tooltip key={mode.value} title={mode.label}>
                {isActive ? (
                  <Button
                    color="primary"
                    onClick={() => setActiveMode(mode.value)}
                    startIcon={<Icon fontSize="small" />}
                    sx={{
                      minWidth: 0,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 2,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mode.label}
                  </Button>
                ) : (
                  <IconButton
                    aria-label={mode.label}
                    onClick={() => setActiveMode(mode.value)}
                    sx={{
                      color: "text.secondary",
                      borderRadius: 2,
                      "&:hover": {
                        color: "primary.main",
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                )}
              </Tooltip>
            );
          })}
        </Box>
      </Box>


      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          bgcolor: "grey.100",
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            width: previewWidths[activeMode],
            maxWidth: "100%",
            minHeight: "100%",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            p: 3,
            transition: "width 0.2s ease",
          }}
        >
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            {orderedSections.length === 0 && !isLoading
              ? `پیش نمایش سایت در حالت ${activeModeLabel}`
              : null}
          </Typography>

          {isLoading && (
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              در حال آماده‌سازی پیش‌نمایش...
            </Typography>
          )}

          {orderedSections.map((section) => (
            <Box
              key={`${section.key}-${section.orderIndex}`}
              sx={{ width: "100%" }}
              dangerouslySetInnerHTML={{ __html: section.htmlCode }}
            />
          ))}
        </Box>
      </Box>

      </Paper>
    </>
  );
}
