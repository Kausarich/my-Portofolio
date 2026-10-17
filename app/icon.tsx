import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#111114",
        color: "#eeeef0",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: -2,
        borderRadius: 14,
      }}
    >
      GK<span style={{ color: "#aaa3ff" }}>.</span>
    </div>,
    size,
  );
}
