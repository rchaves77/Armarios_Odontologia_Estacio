import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCYFKI7w7Lhe4ljvrO13s7e8cERMsBVr2Q",
  authDomain: "chaves-estacio.firebaseapp.com",
  databaseURL: "https://chaves-estacio-default-rtdb.firebaseio.com",
  projectId: "chaves-estacio",
  storageBucket: "chaves-estacio.firebasestorage.app",
  messagingSenderId: "1052463955885",
  appId: "1:1052463955885:web:32abff964d95be9f95ab24",
  measurementId: "G-CESXMKVRE0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Safe Analytics Initialization for Sandboxed/iFrame environments
try {
  if (typeof window !== "undefined") {
    getAnalytics(app);
  }
} catch (error) {
  console.warn("Firebase Analytics could not be loaded in sandbox environment:", error);
}

export default app;
