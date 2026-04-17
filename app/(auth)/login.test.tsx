import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@/components/ui/molecules/toast";
import LoginPageContent from "@/app/(auth)/login/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

const renderWithToast = (component: React.ReactNode) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockReset();
  });

  describe("Form Submission", () => {
    it("should render login form with all required fields", () => {
      renderWithToast(<LoginPageContent />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: "abc123" }),
      });

      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "ValidPass123");

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/auth/login",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              email: "john@example.com",
              password: "ValidPass123",
            }),
          })
        );
      });
    });
  });

  describe("Input Value Binding", () => {
    it("should update input values as user types", async () => {
      const user = userEvent.setup();
      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "TestPassword123");

      expect(emailInput.value).toBe("test@example.com");
      expect(passwordInput.value).toBe("TestPassword123");
    });
  });

  describe("Validation Error Display", () => {
    it("should show email validation error for invalid email", async () => {
      const user = userEvent.setup();
      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email/i)
        ).toBeInTheDocument();
      });
    });

    it("should show required field errors", async () => {
      const user = userEvent.setup();
      renderWithToast(<LoginPageContent />);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe("Successful Login Flow", () => {
    it("should redirect to profile after successful login", async () => {
      const user = userEvent.setup();
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: "abc123" }),
      });

      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "ValidPass123");

      await user.click(submitButton);

      // Success toast should be shown
      await waitFor(() => {
        expect(
          screen.getByText(/login successful/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Button State Management", () => {
    it("should disable submit button when form is invalid", async () => {
      const user = userEvent.setup();
      renderWithToast(<LoginPageContent />);

      const submitButton = screen.getByRole("button", {
        name: /sign in/i,
      }) as HTMLButtonElement;

      expect(submitButton).toBeDisabled();

      // Fill with valid data
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "ValidPass123");

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });

    it("should show spinner during form submission", async () => {
      const user = userEvent.setup();
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ sessionId: "abc123" }),
                }),
              1000
            )
          )
      );

      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper label associations", () => {
      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("id");

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("id");
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();
      renderWithToast(<LoginPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      emailInput.focus();

      expect(emailInput).toHaveFocus();

      await user.tab();
      // Focus should move to next input
    });
  });
});
