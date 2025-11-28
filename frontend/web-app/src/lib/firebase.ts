import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSysNsuxpm6i4MKu1Hjyr1GomAO3O8oI4",
  authDomain: "tf-icre-platform-2025.firebaseapp.com",
  projectId: "tf-icre-platform-2025",
  storageBucket: "tf-icre-platform-2025.firebasestorage.app",
  messagingSenderId: "400867763360",
  appId: "1:400867763360:web:ab68fd8c05960201b515c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };