import type { Preview } from "@storybook/nextjs-vite";
import { Manrope } from "next/font/google";
import React from "react";
import "../app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (375px)",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        desktop: {
          name: "Desktop (1440px)",
          styles: {
            width: "1440px",
            height: "900px",
          },
        },
      },
      defaultViewport: "mobile",
    },
  },
  decorators: [
    (Story) => (
      <div className={`${manrope.variable} font-sans`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
