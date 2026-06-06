import React from "react";
import { theme } from "@/theme";

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: theme.spacing(2),
        borderRadius: theme.radius.md,
        background: theme.colors.surface,
        boxShadow: theme.shadow.sm,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
