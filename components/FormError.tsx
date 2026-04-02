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
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      {message && <p className="text-sm text-red-600 font-medium">{message}</p>}
      {errors && errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map((error, idx) => (
            <li key={idx} className="text-sm text-red-600 flex items-start">
              <span className="mr-2">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
