import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwFeNOeCX2eRaTczWAJuEit3BMPRXDUAY",
  authDomain: "portalhta-f684c.firebaseapp.com",
  projectId: "portalhta-f684c",
  storageBucket: "portalhta-f684c.firebasestorage.app",
  messagingSenderId: "971773680288",
  appId: "1:971773680288:web:3adc5e45db96ee9a1507c5",
  measurementId: "G-CLRPN225YN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export default app;