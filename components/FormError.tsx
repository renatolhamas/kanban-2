"use client";

interface FormErrorProps {
  message?: string;
  errors?: string[];
}

export function FormError({ message, errors }: FormErrorProps) {
  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  return (
    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          {message && <p className="text-sm font-medium text-red-800">{message}</p>}
          {errors && errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
