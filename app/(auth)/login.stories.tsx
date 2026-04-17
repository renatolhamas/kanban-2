import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToastProvider } from "@/components/ui/molecules/toast";
import LoginPageContent from "@/app/(auth)/login/page";
import { DarkModeDecorator } from "@/.storybook/decorators/DarkModeDecorator";

const meta: Meta<typeof LoginPageContent> = {
  title: "Pages/Auth/Login",
  component: LoginPageContent,
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
 * Default state: Empty login form ready for input
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
 * (Invalid email or password format)
 */
export const WithErrors: Story = {
  parameters: {
    mockData: {
      errors: {
        email: "Please enter a valid email address",
        password: "Password is required",
      },
    },
  },
};

/**
 * Success state: Success Toast notification shown
 * (User successfully logged in)
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
        password: "ValidPass123",
      },
    },
  },
};

/**
 * Invalid credentials state: API error response
 * (User entered wrong email or password)
 */
export const InvalidCredentials: Story = {
  parameters: {
    mockData: {
      error: "Invalid email or password",
    },
  },
};
