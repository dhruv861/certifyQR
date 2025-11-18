import { getApp, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: This file is used on the server-side only.

let app: App;
if (!getApps().length) {
    app = initializeApp();
} else {
    app = getApp();
}

const auth = getAuth(app);
const firestore = getFirestore(app);

export function getFirebase() {
  return { app, auth, firestore };
}
