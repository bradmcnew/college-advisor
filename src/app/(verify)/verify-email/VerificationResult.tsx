"use client";

import { useEffect } from "react";

interface VerificationResultProps {
  success: boolean;
  message: string;
}

const VerificationResult: React.FC<VerificationResultProps> = ({
  success,
  message,
}) => {
  useEffect(() => {
    if (success) {
      // Close the current tab after a short delay
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [success]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="rounded bg-white p-6 shadow dark:bg-gray-800">
        <h2
          className={`text-xl font-semibold ${success ? "text-green-600" : "text-red-600"}`}
        >
          {success ? "Success!" : "Error"}
        </h2>
        <p className="mt-2 text-center">{message}</p>
        {!success && (
          <button
            onClick={() => window.close()}
            className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white"
          >
            Close
          </button>
        )}
        {success && (
          <p className="mt-4 text-center text-sm text-gray-500">
            You can now return to the original tab.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerificationResult;
