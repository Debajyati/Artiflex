export const FirebaseConfig = {
  apiKey: "AIzaAIza...something-gibberish...AIza!",
  authDomain: "artiflex-authdomain.firevase.com",
  projectId: "artiflex-project-id",
  storageBucket: "artiflex-storage.firebasestorage.app",
  messagingSenderId: "Elder Gods phone number XD",
  appId: "1:gibberish_pgone;nu,mber_of_basatan:web:IDK-LOL",
  measurementId: "You'd know better! huhu!"
};

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
export const app = initializeApp(FirebaseConfig);
export const db = getFirestore(app);
