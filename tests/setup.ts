import '@testing-library/jest-dom';
import '../app/globals.css';

// Global test setup
beforeEach(() => {
  // Reset DOM between tests
  document.body.innerHTML = '';
});
