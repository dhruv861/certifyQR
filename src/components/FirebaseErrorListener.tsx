'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client component that listens for Firestore permission errors
// and throws them to be caught by the Next.js error boundary.
// This is only active in development to aid in debugging security rules.
export function FirebaseErrorListener() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handlePermissionError = (error: Error) => {
      // Throw the error to be caught by the Next.js error boundary.
      // This will show the error overlay in development.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
