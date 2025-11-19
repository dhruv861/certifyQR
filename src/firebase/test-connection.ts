// Test Firebase connection
// You can run this in your browser console after updating the config

import { firebaseConfig } from "./config";

export function testFirebaseConnection() {
  console.log("Firebase Config:", firebaseConfig);

  // Check if configuration looks valid
  const isValid = firebaseConfig.apiKey !== "YOUR_ACTUAL_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID" && firebaseConfig.apiKey.startsWith("AIza");

  if (isValid) {
    console.log("✅ Firebase configuration appears valid");
  } else {
    console.log("❌ Firebase configuration needs to be updated");
  }

  return isValid;
}

// Example of how to test a simple write operation
export async function testFirestoreWrite(firestore: any) {
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const testDoc = doc(firestore, "test", "connection-test");
    await setDoc(testDoc, {
      timestamp: new Date().toISOString(),
      status: "connected",
    });
    console.log("✅ Firestore write test successful");
    return true;
  } catch (error) {
    console.error("❌ Firestore write test failed:", error);
    return false;
  }
}
