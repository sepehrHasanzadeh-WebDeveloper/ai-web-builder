"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LaptopMacOutlinedIcon from "@mui/icons-material/LaptopMacOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import TabletMacOutlinedIcon from "@mui/icons-material/TabletMacOutlined";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import Script from "next/script";
import { useRef, useState } from "react";
import type { GeneratedSection } from "../api/builder.api";
import { useBuilderChat } from "../contexts/BuilderChatContext";

type PreviewMode = "mobile" | "tablet" | "laptop";

type SectionContextMenu = {
  section: GeneratedSection;
  x: number;
  y: number;
};

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
  const {
    generatedSections,
    isLoading,
    isLoadingHistory,
    isProjectLoading,
    isCreatingProject,
    isReordering,
    projectId,
    activeSection,
    startAddingSection,
    createNewProject,
    selectSection,
    reorderSections,
    deleteSection,
  } = useBuilderChat();
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(
    null,
  );
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(
    null,
  );
  const didDragRef = useRef(false);
  const draggingSectionIdRef = useRef<string | null>(null);
  const [sectionContextMenu, setSectionContextMenu] =
    useState<SectionContextMenu | null>(null);
  const activeModeLabel =
    previewModes.find((mode) => mode.value === activeMode)?.label ?? "";
  const orderedSections = [...generatedSections].sort(
    (first, second) => first.orderIndex - second.orderIndex,
  );

  return (
    <>
      {/* کلاس‌های Tailwind تولیدشده توسط AI در زمان build قابل اسکن نیستند. */}
      <Script id="tailwind-preview-runtime" strategy="afterInteractive">
        {`
(() => {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    corePlugins: { preflight: false },
    important: "#ai-preview",
  };

  const script = document.createElement("script");
  script.src = "https://cdn.tailwindcss.com";
  script.async = false;
  document.head.appendChild(script);
})();
`}
      </Script>

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
          position: "relative",
          isolation: "isolate",
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
      borderRadius: "10px",
      bgcolor: "primary.main",
      color: "primary.contrastText",
      boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        bgcolor: "primary.dark",
        transform: "translateY(-1px)",
        boxShadow: (theme) => `0 6px 16px ${theme.palette.primary.main}55`,
      },
      "&:active": {
        transform: "translateY(0)",
      },
    }}
  >
    <FileDownloadOutlinedIcon fontSize="small" />
  </IconButton>
</Tooltip>

          <Box
  sx={{
    position: "absolute",
    right: 16,
    display: "flex",
    alignItems: "center",
    gap: 2, // فاصله منظم و استاندارد بین متن و دکمه
  }}
>
  {/* عنوان فارسی با استایل رسمی */}
  <Typography
    variant="subtitle2"
    sx={{
      fontWeight: 700,
      color: "text.primary",
      fontSize: { xs: "0.85rem", md: "0.92rem" },
      whiteSpace: "nowrap",
    }}
  >
    پیش‌نمایش وب‌سایت
  </Typography>

  {projectId && (
    <Button
      variant="contained"
      color="primary"
      size="small"
      startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
      onClick={startAddingSection}
      disabled={isLoadingHistory || isLoading}
      sx={{
        px: 1.8,
        py: 0.6,
        borderRadius: "6px", // ظاهر اداری و رسمی‌تر
        whiteSpace: "nowrap",
        fontSize: { xs: "0.75rem", md: "0.8rem" },
        fontWeight: 600,
        boxShadow: "none",
        border: "1px solid transparent",
        transition: "all 0.15s ease-in-out",
        "&:hover": {
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          transform: "translateY(-1px)",
        },
        "&:disabled": {
          transform: "none",
        },
      }}
    >
      افزودن بخش جدید
    </Button>
  )}
</Box>

          {/* Responsive preview modes */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              direction: "ltr",
            }}
          >
         <Box
  sx={{
    display: "inline-flex",
    alignItems: "center",
    p: 0.5,
    borderRadius: "10px",
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    gap: 0.5,
  }}
>
  {previewModes.map((mode) => {
    const Icon = mode.icon;
    const isActive = activeMode === mode.value;

    return (
      <Box
        key={mode.value}
        component="button"
        type="button"
        onClick={() => setActiveMode(mode.value)}
        sx={{
          border: "none",
          outline: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 44,
          px: 1.2,
          py: 0.8,
          borderRadius: "8px",
          bgcolor: isActive ? "action.selected" : "transparent",
          color: isActive ? "primary.main" : "text.secondary",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            bgcolor: isActive ? "action.selected" : "action.hover",
            color: "primary.main",
            "& .mode-label": {
              maxHeight: 20,
              opacity: 1,
              mt: 0.4,
            },
          },
        }}
      >
        <Icon
          sx={{
            fontSize: 18,
            transition: "transform 0.2s ease",
            transform: isActive ? "scale(1.08)" : "none",
          }}
        />

        {/* متن زیر آیکون که در حالت فعال همیشه نمایان است و با هاور باز می‌شود */}
        <Typography
          variant="caption"
          className="mode-label"
          sx={{
            fontSize: "0.68rem",
            fontWeight: isActive ? 700 : 500,
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "all 0.2s ease-in-out",
            maxHeight: isActive ? 20 : 0,
            opacity: isActive ? 1 : 0,
            mt: isActive ? 0.4 : 0,
          }}
        >
          {mode.label}
        </Typography>
      </Box>
    );
  })}
</Box>
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
            id="ai-preview"
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
            {!isProjectLoading && !projectId && (
              <Box
                sx={{
                  minHeight: "60vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: 1.5,
                  px: 2,
                }}
              >
                <AutoAwesomeRoundedIcon
                  sx={{ fontSize: 42, color: "primary.main", opacity: 0.8 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  هنوز پروژه‌ای ندارید
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  برای شروع ساخت سایت، یک پروژه جدید بسازید.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => void createNewProject()}
                  disabled={isCreatingProject}
                  sx={{ mt: 1, borderRadius: 2, px: 3 }}
                >
                  {isCreatingProject ? "در حال ساخت پروژه..." : "ساخت پروژه"}
                </Button>
              </Box>
            )}

            {projectId && orderedSections.length === 0 && !isLoading && (
              <Typography color="text.secondary" sx={{ textAlign: "center" }}>
                پیش‌نمایش سایت در حالت {activeModeLabel}
              </Typography>
            )}

            {orderedSections.map((section) => (
              <Box
                key={`${section.key}-${section.orderIndex}`}
                component="section"
                role="button"
                tabIndex={0}
                draggable={!isLoading && !isReordering}
                aria-label={`ویرایش ${section.name}. برای جابه‌جایی بکشید`}
                onClick={() => {
                  if (didDragRef.current) {
                    didDragRef.current = false;
                    return;
                  }

                  void selectSection(section);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setSectionContextMenu({
                    section,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
                onDragStart={(event) => {
                  didDragRef.current = false;
                  draggingSectionIdRef.current = section.id;
                  setDraggingSectionId(section.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", section.id);
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (draggingSectionIdRef.current !== section.id) {
                    setDragOverSectionId(section.id);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  if (draggingSectionId !== section.id) {
                    setDragOverSectionId(section.id);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceId =
                    event.dataTransfer.getData("text/plain") ||
                    draggingSectionIdRef.current;

                  if (sourceId && sourceId !== section.id) {
                    didDragRef.current = true;
                    void reorderSections(sourceId, section.id);
                  }

                  setDraggingSectionId(null);
                  setDragOverSectionId(null);
                  draggingSectionIdRef.current = null;
                }}
                onDragEnd={() => {
                  setDraggingSectionId(null);
                  setDragOverSectionId(null);
                  draggingSectionIdRef.current = null;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void selectSection(section);
                  }
                }}
                sx={{
                  width: "100%",
                  position: "relative",
                  cursor: isReordering ? "wait" : "grab",
                  borderRadius: 1.5,
                  isolation: "isolate",
                  opacity: draggingSectionId === section.id ? 0.45 : 1,
                  border: "1px solid transparent",
                  borderColor:
                    dragOverSectionId === section.id
                      ? "primary.main"
                      : "transparent",
                  outline: "2px solid transparent",
                  outlineOffset: 3,
                  transition:
                    "outline-color 160ms ease, background-color 160ms ease",
                  "&:hover": {
                    outlineColor: "rgba(99, 102, 241, 0.3)",
                    bgcolor: "rgba(99, 102, 241, 0.035)",
                  },
                  "&:active": {
                    cursor: "grabbing",
                  },
                  "&:focus-visible": {
                    outlineColor: "primary.main",
                  },
                }}
                title={`برای ویرایش «${section.name}» کلیک کنید`}
              >
                {isLoading && activeSection?.id === section.id && (
                  <Box
                    role="status"
                    aria-label={`در حال ویرایش ${section.name}`}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 1.5,
                      p: { xs: 2, md: 4 },
                      bgcolor: "background.paper",
                    }}
                  >
                    <Skeleton
                      animation="wave"
                      variant="rounded"
                      height={72}
                      width="48%"
                      sx={{
                        backgroundColor: "#94A3B8 !important",
                        border: "1px solid #64748B",
                      }}
                    />
                    <Skeleton
                      animation="wave"
                      variant="rounded"
                      height={34}
                      width="86%"
                      sx={{
                        backgroundColor: "#94A3B8 !important",
                        border: "1px solid #64748B",
                      }}
                    />
                    <Skeleton
                      animation="wave"
                      variant="rounded"
                      height={34}
                      width="72%"
                      sx={{
                        backgroundColor: "#94A3B8 !important",
                        border: "1px solid #64748B",
                      }}
                    />
                    <Skeleton
                      animation="wave"
                      variant="rounded"
                      height={58}
                      width="34%"
                      sx={{
                        mt: 1,
                        backgroundColor: "#94A3B8 !important",
                        border: "1px solid #64748B",
                      }}
                    />
                  </Box>
                )}

                <Tooltip title="برای جابه‌جایی بکشید">
                  <Box
                    className="section-drag-handle"
                    draggable={!isLoading && !isReordering}
                    aria-label={`جابه‌جایی ${section.name}`}
                    onClick={(event) => event.stopPropagation()}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      didDragRef.current = false;
                      draggingSectionIdRef.current = section.id;
                      setDraggingSectionId(section.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", section.id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      zIndex: 9999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      color: "text.secondary",
                      bgcolor: "rgba(255, 255, 255, 0.88)",
                      boxShadow: 1,
                      cursor: isReordering ? "wait" : "grab",
                      transition: "opacity 160ms ease, color 160ms ease",
                      "&:hover": {
                        color: "primary.main",
                      },
                      "&:active": {
                        cursor: "grabbing",
                      },
                      opacity: isReordering ? 0.45 : 0.7,
                    }}
                  >
                    <DragIndicatorRoundedIcon fontSize="small" />
                  </Box>
                </Tooltip>
                <Box dangerouslySetInnerHTML={{ __html: section.htmlCode }} />
              </Box>
            ))}
          </Box>
        </Box>

        {isLoading && !activeSection && (
          <Box
            role="status"
            aria-live="polite"
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 3,
              bgcolor: "rgba(15, 23, 42, 0.58)",
              backdropFilter: "blur(2px)",
            }}
          >
            <Box sx={{ width: "min(360px, 80%)", textAlign: "center" }}>
              <Typography
                sx={{
                  mb: 1.5,
                  color: "common.white",
                  fontWeight: 700,
                }}
              >
                هوش مصنوعی در حال ساخت است...
              </Typography>
              <LinearProgress
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(255, 255, 255, 0.24)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                  },
                }}
              />
            </Box>
          </Box>
        )}

        <Menu
          open={Boolean(sectionContextMenu)}
          onClose={() => setSectionContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={
            sectionContextMenu
              ? { top: sectionContextMenu.y, left: sectionContextMenu.x }
              : undefined
          }
          slotProps={{
            paper: {
              sx: {
                minWidth: 190,
                borderRadius: 2,
                direction: "rtl",
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              if (!sectionContextMenu) return;
              const selectedSection = sectionContextMenu.section;
              setSectionContextMenu(null);
              void selectSection(selectedSection);
            }}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>ویرایش سکشن</ListItemText>
          </MenuItem>
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={() => {
              if (!sectionContextMenu) return;
              const selectedSection = sectionContextMenu.section;
              setSectionContextMenu(null);

              if (
                window.confirm(
                  `آیا از حذف سکشن «${selectedSection.name}» مطمئن هستید؟`,
                )
              ) {
                void deleteSection(selectedSection.id);
              }
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>حذف سکشن</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </>
  );
}
