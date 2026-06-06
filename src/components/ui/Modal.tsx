import React from "react";
import { theme } from "@/theme";

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.colors.background,
          padding: theme.spacing(2),
          borderRadius: theme.radius.md,
          width: 400,
          boxShadow: theme.shadow.md,
        }}
      >
        {children}
      </div>
    </div>
  );
}
