import React from "react";

interface Props {
  status: string;
}

const steps = [
  { key: "pending", label: "Order Received", icon: "📥" },
  { key: "preparing", label: "Preparing Your Order", icon: "👨‍🍳" },
  { key: "ready", label: "Ready for Pickup", icon: "📦" },
  { key: "picked_up", label: "Picked Up", icon: "🚗" },
  { key: "delivered", label: "Delivered", icon: "🏁" },
];

export default function OrderTimeline({ status }: Props) {
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div style={{ marginTop: 30 }}>
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;

        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 25,
              opacity: isActive ? 1 : 0.4,
              transition: "0.3s",
            }}
          >
            {/* ICON */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: isActive ? "#4caf50" : "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                marginRight: 15,
                transition: "0.3s",
              }}
            >
              {step.icon}
            </div>

            {/* LABEL */}
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: isActive ? "bold" : "normal",
                  color: isActive ? "#4caf50" : "#777",
                }}
              >
                {step.label}
              </div>

              {/* PROGRESS BAR */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    height: 4,
                    width: "200px",
                    background: "#ddd",
                    marginTop: 8,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: isActive ? "100%" : "0%",
                      background: "#4caf50",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
