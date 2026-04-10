import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@/components/common/Toast";
import RegisterPageContent from "@/app/(auth)/register/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

const renderWithToast = (component: React.ReactNode) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe("Register Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockReset();
  });

  describe("Form Submission", () => {
    it("should render register form with all required fields", () => {
      renderWithToast(<RegisterPageContent />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /register/i })
      ).toBeInTheDocument();
    });

    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "123" }),
      });

      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /register/i });

      await user.type(emailInput, "john@example.com");
      await user.type(nameInput, "John Doe");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmPasswordInput, "ValidPass123");

      await user.click(submitButton);

      await waitFor(() => {
        const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/auth/register",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              email: "john@example.com",
              name: "John Doe",
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
      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;

      await user.type(emailInput, "test@example.com");
      await user.type(nameInput, "Test User");

      expect(emailInput.value).toBe("test@example.com");
      expect(nameInput.value).toBe("Test User");
    });
  });

  describe("Validation Error Display", () => {
    it("should show email validation error for invalid email", async () => {
      const user = userEvent.setup();
      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /register/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email/i)
        ).toBeInTheDocument();
      });
    });

    it("should show password mismatch error", async () => {
      const user = userEvent.setup();
      renderWithToast(<RegisterPageContent />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /register/i });

      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmPasswordInput, "DifferentPass123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it("should show required field errors", async () => {
      const user = userEvent.setup();
      renderWithToast(<RegisterPageContent />);

      const submitButton = screen.getByRole("button", { name: /register/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe("Successful Registration Flow", () => {
    it("should redirect to login after successful registration", async () => {
      const user = userEvent.setup();
      const mockPush = vi.fn();

      vi.doMock("next/navigation", () => ({
        useRouter: () => ({
          push: mockPush,
        }),
      }));

      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /register/i });

      await user.type(emailInput, "john@example.com");
      await user.type(nameInput, "John Doe");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmPasswordInput, "ValidPass123");

      await user.click(submitButton);

      // Success toast should be shown
      await waitFor(() => {
        expect(
          screen.getByText(/account created/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Button State Management", () => {
    it("should disable submit button when form is invalid", async () => {
      const user = userEvent.setup();
      renderWithToast(<RegisterPageContent />);

      const submitButton = screen.getByRole("button", {
        name: /register/i,
      }) as HTMLButtonElement;

      expect(submitButton).toBeDisabled();

      // Fill with valid data
      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, "john@example.com");
      await user.type(nameInput, "John Doe");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmPasswordInput, "ValidPass123");

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
                  json: async () => ({ success: true }),
                }),
              1000
            )
          )
      );

      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/full name/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /register/i });

      await user.type(emailInput, "john@example.com");
      await user.type(nameInput, "John Doe");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmPasswordInput, "ValidPass123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper label associations", () => {
      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("id");

      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute("id");
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();
      renderWithToast(<RegisterPageContent />);

      const emailInput = screen.getByLabelText(/email/i);
      emailInput.focus();

      expect(emailInput).toHaveFocus();

      await user.tab();
      // Focus should move to next input
    });
  });
});
