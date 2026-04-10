import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AtmosphereCheck } from "./AtmosphereCheck";

const meta: Meta<typeof AtmosphereCheck> = {
  title: "Diagnostics/AtmosphereCheck",
  component: AtmosphereCheck,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AtmosphereCheck>;

export const Default: Story = {};
