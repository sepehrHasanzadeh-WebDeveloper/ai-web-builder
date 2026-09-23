"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  alpha,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const navLinks = [
  { label: "خانه", href: "/" },
  { label: "سایت ساز", href: "/builder" },
  { label: "قیمت‌گذاری", href: "#pricing" },
];

function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/builder" || pathname.startsWith("/builder/")) {
    return null;
  }

 

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        top: 20,
        mx: "auto",
        mt: 3,
        maxWidth: "lg",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "calc(100% - 32px)",
        borderRadius: "18px",

        // Background مشخص
        backgroundColor: theme.palette.background.paper,

        // بدون border
        border: "none",

        // Shadow نرم
        boxShadow: `
          0 10px 30px ${alpha(theme.palette.common.black, 0.08)},
          0 2px 8px ${alpha(theme.palette.common.black, 0.04)}
        `,

        color: "text.primary",

        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "68px",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.15rem",
                color: "text.primary",
                letterSpacing: "-0.02em",
              }}
            >
              سایت‌ساز
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {navLinks.map((item) => (
              <Button
                key={item.label}
                href={item.href}
                sx={{
                  color: "text.secondary",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  px: 2,
                  py: 0.8,
                  borderRadius: "9px",

                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* CTA + Mobile Menu */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              disableElevation
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 0.9,
                fontSize: "0.88rem",
                fontWeight: 600,
                borderRadius: "9px",
                whiteSpace: "nowrap",

                transition: "all 0.2s ease",

                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-1px)",
                  boxShadow: `0 6px 16px ${alpha(
                    theme.palette.primary.main,
                    0.25,
                  )}`,
                },
              }}
            >
              همین الان شروع کن
            </Button>

            <IconButton
              color="inherit"
              aria-label="باز کردن منو"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: "none" },
                color: "text.primary",
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          slotProps={{
            paper: {
              sx: {
                width: 260,
                p: 2.5,
                backgroundColor: theme.palette.background.paper,
                boxShadow: `-8px 0 30px ${alpha(
                  theme.palette.common.black,
                  0.08,
                )}`,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              منوی دسترسی
            </Typography>

            <IconButton onClick={handleDrawerToggle} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <List sx={{ pt: 1 }}>
            {navLinks.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  href={item.href}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: "9px",

                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.95rem",
                          fontWeight: 500,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
    
    </AppBar>
  );
}

export default Navbar;
