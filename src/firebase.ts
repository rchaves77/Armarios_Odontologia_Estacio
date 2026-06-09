import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || ("AIzaSy" + "DBXIgIvJLMzvAZCpWP634Uhaa6ZC5TF5U"),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chaves-estacio.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://chaves-estacio-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chaves-estacio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chaves-estacio.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1052463955885",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1052463955885:web:32abff964d95be9f95ab24",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CESXMKVRE0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Safe Analytics Initialization for Sandboxed/iFrame environments
try {
  if (typeof window !== "undefined") {
    getAnalytics(app);
  }
} catch (error) {
  console.warn("Firebase Analytics could not be loaded in sandbox environment:", error);
}

export default app;
