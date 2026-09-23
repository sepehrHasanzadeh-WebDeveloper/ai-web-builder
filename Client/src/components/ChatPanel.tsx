"use client";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useBuilderChat } from "../contexts/BuilderChatContext";

export default function ChatPanel() {
  const {
    messages,
    input,
    isLoading,
    isProjectLoading,
    isLoadingHistory,
    projectId,
    chatMode,
    activeSection,
    error,
    setInput,
    sendMessage,
    clearMessages,
    returnToProjectChat,
  } = useBuilderChat();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 0,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: "700" }}>
            {chatMode === "add-section"
              ? "افزودن بخش جدید"
              : chatMode === "edit-section"
                ? `ویرایش ${activeSection?.name ?? "بخش"}`
                : "دستیار آنلاین هوشمند"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "success.main",
              }}
            />

            <Typography variant="body2">انلاین</Typography>
          </Box>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "red" }}
        >
          {chatMode !== "project" && (
            <Tooltip title="بازگشت به گفت‌وگوی پروژه">
              <IconButton
                aria-label="بازگشت به گفت‌وگوی پروژه"
                onClick={returnToProjectChat}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <ArrowForwardRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="حذف پیام ها">
            <IconButton
              aria-label="حذف پیام ها"
              onClick={clearMessages}
              size="small"
              sx={{ color: "inherit" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {isLoadingHistory && (
          <Typography color="text.secondary" variant="body2">
            در حال دریافت تاریخچه گفتگو...
          </Typography>
        )}

        {!isProjectLoading && !projectId && !isLoadingHistory && (
          <Typography color="text.secondary" variant="body2">
            برای شروع، ابتدا از پنل پیش‌نمایش یک پروژه بسازید.
          </Typography>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <Typography color="text.secondary" variant="body2">
            گفتگو با AI را از اینجا شروع کنید.
          </Typography>
        )}

        {messages.map((item) => (
          <Box
            key={item.id}
            sx={{
              alignSelf: item.role === "user" ? "flex-start" : "flex-end",
              maxWidth: "88%",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                px: 0.5,
                color: "text.secondary",
                textAlign: item.role === "user" ? "right" : "left",
              }}
            >
              {item.role === "user" ? "شما" : "دستیار هوشمند"}
            </Typography>

            <Box
              sx={{
                px: 1.5,
                py: 1.1,
                borderRadius:
                  item.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                bgcolor: item.role === "user" ? "primary.main" : "action.hover",
                color:
                  item.role === "user"
                    ? "primary.contrastText"
                    : "text.primary",
                border: "1px solid",
                borderColor: item.role === "user" ? "primary.main" : "divider",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.8,
              }}
            >
              <Typography variant="body2">{item.content}</Typography>
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Typography color="text.secondary" variant="body2">
            هوش مصنوعی در حال ساخت وب‌سایت است...
          </Typography>
        )}

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
      </Box>

      {/* Input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          direction: "ltr",
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          type="submit"
          variant="contained"
          startIcon={
            isLoading ? (
              <CircularProgress size={17} thickness={5} color="inherit" />
            ) : (
              <SendRoundedIcon fontSize="small" />
            )
          }
          aria-busy={isLoading}
          disabled={
            !input.trim() ||
            isLoading ||
            isLoadingHistory ||
            isProjectLoading ||
            !projectId
          }
          sx={{
            minWidth: 92,
            height: 40,
            borderRadius: 2,
            flexShrink: 0,
            color: "common.white",
            background: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)",
            boxShadow: "0 5px 14px rgba(167, 139, 250, 0.28)",
            "&:hover": {
              background: "linear-gradient(135deg, #B8A5FA 0%, #9276F2 100%)",
              boxShadow: "0 7px 18px rgba(167, 139, 250, 0.34)",
            },
            "&.Mui-disabled": {
              color: "rgba(255, 255, 255, 0.75)",
              background: "#D8D0F7",
              boxShadow: "none",
            },
          }}
        >
          {isLoading ? "در حال ارسال..." : "ارسال"}
        </Button>

        <TextField
          value={input}
          onChange={(event) => setInput(event.target.value)}
          fullWidth
          size="small"
          placeholder="پیام خود را بنویسید..."
          autoComplete="off"
          disabled={isLoading || isProjectLoading || !projectId}
          slotProps={{
            htmlInput: { "aria-label": "متن پیام" },
          }}
          sx={{
            direction: "rtl",
            "& .MuiOutlinedInput-root": {
              height: 40,
              borderRadius: 2,
              bgcolor: "background.default",
              fontSize: "0.85rem",
              "& fieldset": {
                borderColor: "divider",
              },
              "&:hover fieldset": {
                borderColor: "primary.light",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
}
