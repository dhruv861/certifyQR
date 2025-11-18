// src/firebase/client-provider.tsx
'use client';
import {
  type ReactNode,
} from 'react';

import {
  FirebaseApp,
  initializeApp,
  getApp,
  getApps,
} from 'firebase/app';
import {
  Auth,
  getAuth,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
    children: ReactNode;
}

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// Initialize Firebase on the client side
if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);

    if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
        const host = process.env.NEXT_PUBLIC_EMULATOR_HOST;
        // Point to the Auth emulator
        connectAuthEmulator(auth, `http://${host}:9099`, {
            disableWarnings: true,
        });
        // Point to the Firestore emulator
        connectFirestoreEmulator(firestore, host, 8080);
    }
} else {
    // Use the existing app if it has already been initialized
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider app={firebaseApp} auth={auth} firestore={firestore}>
        {children}
    </FirebaseProvider>
  );
}
