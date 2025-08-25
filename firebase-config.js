import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBcQ5oyLvJL5abrD95xl404_2UrBZjM2iE",
  authDomain: "vehicleloginsystem.firebaseapp.com",
  projectId: "vehicleloginsystem",
  storageBucket: "vehicleloginsystem.appspot.com",
  messagingSenderId: "335291119893",
  appId: "1:335291119893:web:24bc54501717f10530d11c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
