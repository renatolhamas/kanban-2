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

// Global test setup
beforeEach(() => {
  // Reset DOM between tests
  document.body.innerHTML = '';
});
