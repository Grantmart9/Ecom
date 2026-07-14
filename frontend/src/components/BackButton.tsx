'use client'

import Link from "next/link"
import { IconButton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

interface BackButtonProps {
  href: string
}

export default function BackButton({ href }: BackButtonProps) {
  return (
    <IconButton
      component={Link}
      href={href}
      aria-label="Go back"
      sx={{
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": { borderColor: "primary.main", color: "primary.main" },
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  )
}
