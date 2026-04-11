import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToastProvider } from "@/components/common/Toast";
import RegisterPageContent from "@/app/(auth)/register/page";
import { DarkModeDecorator } from "@/.storybook/decorators/DarkModeDecorator";

const meta: Meta<typeof RegisterPageContent> = {
  title: "Pages/Auth/Register",
  component: RegisterPageContent,
  decorators: [
    DarkModeDecorator,
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Empty register form ready for input
 */
export const Default: Story = {};

/**
 * Loading state: Button disabled with spinner, inputs disabled
 * (User has submitted form and waiting for API response)
 */
export const Loading: Story = {
  parameters: {
    mockData: {
      isLoading: true,
    },
  },
};

/**
 * Error state: Inline field errors displayed below inputs
 * (Multiple validation errors shown)
 */
export const WithErrors: Story = {
  parameters: {
    mockData: {
      errors: {
        email: "Please enter a valid email address",
        password: "Password must contain at least one uppercase letter",
        confirmPassword: "Passwords do not match",
      },
    },
  },
};

/**
 * Success state: Success Toast notification shown
 * (User successfully created account)
 */
export const Success: Story = {
  parameters: {
    mockData: {
      showSuccess: true,
    },
  },
};

/**
 * Filled form state: Form with valid data ready to submit
 * (Demonstrates button in enabled state with all valid inputs)
 */
export const FilledForm: Story = {
  parameters: {
    mockData: {
      formData: {
        email: "john@example.com",
        name: "John Doe",
        password: "ValidPass123",
        confirmPassword: "ValidPass123",
      },
    },
  },
};
