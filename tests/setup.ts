import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import '../app/globals.css';

// Mock HTMLDialogElement methods (not implemented in JSDOM)
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.show = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
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
