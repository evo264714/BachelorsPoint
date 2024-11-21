// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpPbPzHVWY9jkdAmlQ1_DV1bgJgZr3eCc",
  authDomain: "homies-1286d.firebaseapp.com",
  projectId: "homies-1286d",
  storageBucket: "homies-1286d.appspot.com",
  messagingSenderId: "479170524384",
  appId: "1:479170524384:web:4f1bb485f94d70d7ae4c85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);