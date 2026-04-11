import React from 'react';
import type { Decorator } from '@storybook/react';

/**
 * Dark Mode Decorator for Storybook (Story 2.10)
 *
 * Renders components in both light and dark mode side-by-side
 * for visual validation of dark mode implementation.
 *
 * Usage in story file:
 * decorators: [DarkModeDecorator]
 */

export const DarkModeDecorator: Decorator = (Story, context) => {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Light Mode */}
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-900">Light Mode</h3>
        <div className="p-6 rounded-lg border border-gray-200 bg-white">
          <Story {...context} />
        </div>
      </div>

      {/* Dark Mode */}
      <div>
        <h3 className="text-sm font-semibold mb-4 text-gray-900">Dark Mode</h3>
        <div
          className="p-6 rounded-lg border border-gray-800 bg-gray-900 dark"
          data-theme="dark"
        >
          <Story {...context} />
        </div>
      </div>
    </div>
  );
};

export default DarkModeDecorator;
