import { Box, Grid } from "@mui/material";
import ChatPanel from "../../components/ChatPanel";
import BuilderPreview from "../../components/BuilderPreview";
import { BuilderChatProvider } from "../../contexts/BuilderChatContext";


export default function BuilderPage() {
  return (
    <BuilderChatProvider>
      <Box
        sx={{
          // Navbar قبل از Builder در layout رندر می‌شود؛ فضای باقی‌مانده‌ی viewport را بگیر.
          height: "calc(100dvh - 68px)",
          minHeight: 0,
          p: 2,
          marginTop: "8px",
          bgcolor: "background.default",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
              {/* Chat */}
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
                sx={{
                  height: { xs: "50%", md: "100%" },
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <ChatPanel />
              </Grid>
        {/* Preview */}
        <Grid
          size={{
            xs: 12,
            md: 9,
          }}
          sx={{
            height: { xs: "50%", md: "100%" },
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <BuilderPreview />
        </Grid>



        </Grid>
      </Box>
    </BuilderChatProvider>
  );
}
