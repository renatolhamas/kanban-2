import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";
import { useState } from "react";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/**
 * Default state - bg-surface-lowest (#ffffff) with 2px bottom indicator
 */
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    label: "Input Label",
  },
};

/**
 * Focus state - Emerald halo ring and subtle shadow
 */
export const Focused: Story = {
  args: {
    placeholder: "Focused input...",
    label: "Focused Input",
    autoFocus: true,
  },
};

/**
 * Error state - Red/orange indicator with error message
 */
export const Error: Story = {
  args: {
    placeholder: "Enter valid email...",
    label: "Email",
    type: "email",
    error: "Please enter a valid email address",
    defaultValue: "invalid-email",
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    label: "Disabled Field",
    disabled: true,
    defaultValue: "Cannot edit",
  },
};

/**
 * Input with helper text (non-error)
 */
export const WithHelperText: Story = {
  args: {
    placeholder: "Enter password",
    label: "Password",
    type: "password",
    helperText: "Must be at least 8 characters",
  },
};

/**
 * Email input variant
 */
export const Email: Story = {
  args: {
    placeholder: "user@example.com",
    label: "Email Address",
    type: "email",
  },
};

/**
 * Password input variant
 */
export const Password: Story = {
  args: {
    placeholder: "Enter password",
    label: "Password",
    type: "password",
  },
};

/**
 * Number input variant
 */
export const Number: Story = {
  args: {
    placeholder: "0",
    label: "Quantity",
    type: "number",
  },
};

/**
 * Interactive input with state
 */
export const Interactive: Story = {
  render: function InputWithState() {
    const [value, setValue] = useState("");

    return (
      <div className="w-full max-w-sm">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText={value.length > 0 ? `${value.length} characters` : ""}
        />
      </div>
    );
  },
};

/**
 * All states showcase
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <Input label="Default" placeholder="Default input" />
      <Input
        label="Focused"
        placeholder="Focused input"
        autoFocus
        helperText="This field is focused"
      />
      <Input
        label="Error"
        placeholder="Invalid input"
        error="This field has an error"
        defaultValue="Invalid"
      />
      <Input
        label="Disabled"
        placeholder="Disabled input"
        disabled
        defaultValue="Cannot edit"
      />
      <Input
        label="With Helper"
        placeholder="Helpful text below"
        helperText="This is helper text"
      />
    </div>
  ),
};
