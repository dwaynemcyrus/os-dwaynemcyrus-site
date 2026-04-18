import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#000000",
          border: "16px solid #ffffff",
          color: "#ffffff",
          display: "flex",
          fontFamily: "sans-serif",
          fontSize: 176,
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
