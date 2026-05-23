import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAIFD1rx_v0aFbOeDPoQyI9wzJiw5JT9aw",
  authDomain: "auxcordocracy.firebaseapp.com",
  databaseURL: "https://auxcordocracy-default-rtdb.firebaseio.com",
  projectId: "auxcordocracy",
  storageBucket: "auxcordocracy.firebasestorage.app",
  messagingSenderId: "203829712076",
  appId: "1:203829712076:web:c76e8d495daa40135a1e69"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const database = getDatabase(app);
