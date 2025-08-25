import { auth, provider, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==================== LOGIN (Email/Password) ====================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showSuccessMessage();
  } catch (err) {
    alert("Login failed: " + err.message);
  }
});

// ==================== SIGNUP (with OTP + Email/Password) ====================
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const otp = document.getElementById("otpInput").value;
  const role = document.querySelector('input[name="role"]:checked')?.value;

  if (!role) {
    alert("Please select a role: Client or Driver.");
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const result = await res.json();

    if (result.message === 'OTP verified!') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email,
          role
        });

        alert("Signup successful!");
        showSignupSuccessMessage();
        showLogin();

      } catch (firebaseErr) {
        if (firebaseErr.code === 'auth/email-already-in-use') {
          alert("This email is already registered. Please log in instead.");
          showLogin();
        } else {
          console.error("Firebase signup error:", firebaseErr);
          alert("Signup error. Try again.");
        }
      }
    } else {
      alert("Invalid OTP");
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    alert("OTP verification failed");
  }
});

// ==================== SEND OTP ====================
document.getElementById('sendOtpBtn').addEventListener('click', async () => {
  const email = document.getElementById('signupEmail').value;
  if (!email) return alert("Enter email first");

  try {
    const res = await fetch('http://localhost:5000/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.text();
    alert(data);
    document.getElementById('otpSection').style.display = 'block';
  } catch (err) {
    alert("Failed to send OTP");
  }
});

// ==================== LOGIN WITH GOOGLE ====================
document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    showSuccessMessage();
  } catch (err) {
    alert("Google login failed: " + err.message);
  }
});

// ==================== SIGNUP WITH GOOGLE ====================
document.getElementById("googleSignupBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const role = prompt("Are you a 'client' or 'driver'?").toLowerCase();

    if (!['client', 'driver'].includes(role)) {
      alert("Invalid role. Please try signing up again.");
      return;
    }

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role
    });

    alert(`Welcome ${user.displayName}, you've signed up successfully!`);
    window.location.href = role === "client" ? "client_profile.html" : "driver_profile.html";

  } catch (err) {
    alert("Google signup failed: " + err.message);
  }
});

// ==================== ROLE-BASED REDIRECT AFTER LOGIN ====================
async function showSuccessMessage() {
  const user = auth.currentUser;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role;

      document.getElementById('successMessage').style.display = 'flex';
      document.querySelector('.form-box').style.display = 'none';

      setTimeout(() => {
        if (role === "client") {
          window.location.href = 'client_profile.html';
        } else if (role === "driver") {
          window.location.href = 'driver_profile.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 2000);
    } else {
      alert("No user role found. Cannot redirect.");
    }
  } catch (err) {
    console.error("Role fetch failed", err);
    alert("Login successful, but redirection failed.");
  }
}

// ==================== FORM SWITCH ====================
document.getElementById("goToSignup").addEventListener("click", showSignup);
document.getElementById("goToLogin").addEventListener("click", showLogin);

function showSignup() {
  document.querySelector(".form-box").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}

function showLogin() {
  document.querySelector(".form-box").style.display = "block";
  document.getElementById("signupBox").style.display = "none";
}

function showSignupSuccessMessage() {
  document.getElementById('signupBox').style.display = 'none';
  document.getElementById('signupSuccessMessage').style.display = 'flex';
  setTimeout(() => {
    window.location.href = 'login.html'; 
  }, 5000);
}
