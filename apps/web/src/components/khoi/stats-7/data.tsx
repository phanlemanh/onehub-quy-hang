"use client"

import { ReactNode } from "react"
import { BadgeProps } from "@/components/reui/badge"

// ── Types ──

export interface CardData {
  title: string
  subtitle: string
  value: string
  valueColor: string
  badge: {
    color: BadgeProps["variant"]
    icon: ReactNode
    text: string
  }
  subtext: ReactNode
}
