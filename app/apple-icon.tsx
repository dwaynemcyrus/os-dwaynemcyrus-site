import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#000000",
          border: "8px solid #ffffff",
          color: "#ffffff",
          display: "flex",
          fontFamily: "sans-serif",
          fontSize: 62,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.08em",
          width: "100%",
        }}
      >
        PSA
      </div>
    ),
    size,
  );
}
