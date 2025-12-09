import React from 'react';

/**
 * SlideExportWrapper - Fixed 1920x1080 container for PPT export
 * Ensures consistent aspect ratio and no stretching in PowerPoint
 */
export default function SlideExportWrapper({ children }) {
  return (
    <div
      id="export-slide"
      style={{
        width: "1920px",
        height: "1080px",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        backgroundColor: "#0F172A", // Brand background color
        fontFamily: "Inter, system-ui, -apple-system, sans-serif"
      }}
    >
      {children}
    </div>
  );
}
