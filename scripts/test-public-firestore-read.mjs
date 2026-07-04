import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = ["dives", "sites", "species", "boats"];

for (const name of COLLECTIONS) {
  try {
    const q = query(collection(db, name), limit(1));
    const snapshot = await getDocs(q);
    console.log(`✓ ${name}: read allowed (${snapshot.size} docs)`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.code} - ${err.message}`);
  }
}

process.exit(0);
