import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY || "";
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: getPrivateKey(),
  }),
});

const db = getFirestore(app);

const COLLECTIONS = ["dives", "sites", "species", "boats"];

for (const name of COLLECTIONS) {
  const snapshot = await db.collection(name).limit(3).get();
  console.log(`\n=== ${name} (${snapshot.size} sample docs) ===`);
  if (snapshot.empty) {
    console.log("  (empty collection)");
    continue;
  }
  for (const doc of snapshot.docs) {
    console.log(`\n--- ${doc.id} ---`);
    console.log(JSON.stringify(doc.data(), null, 2));
  }
}

process.exit(0);
