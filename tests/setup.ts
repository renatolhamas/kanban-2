import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import type { toHaveNoViolations } from 'jest-axe';
import '../app/globals.css';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

// Mock window.matchMedia (not implemented in JSDOM)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Global test setup
beforeEach(() => {
  // Reset DOM between tests
  document.body.innerHTML = '';
});
