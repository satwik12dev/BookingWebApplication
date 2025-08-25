import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const profileSection = document.getElementById("profileSection");
  const profileDisplaySection = document.getElementById("profileDisplaySection");
  const overviewSection = document.getElementById("overviewSection");

  const homeBtn = document.getElementById("homeBtn");
  const profileBtn = document.getElementById("profileBtn");
  const startDrivingBtn = document.getElementById("startDrivingBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const viewTripsBtn = document.getElementById("viewTripsBtn");

  const profileImageInput = document.getElementById("profileImage");
  const imagePreview = document.getElementById("imagePreview");
  const displayProfileImage = document.getElementById("displayProfileImage");

  let currentUserId = null;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You are not logged in!");
      window.location.href = "login.html";
      return;
    }

    currentUserId = user.uid;
    loadProfileData(currentUserId);
  });

  async function loadProfileData(userId) {
    try {
      const docSnap = await getDoc(doc(db, "drivers", userId));
      if (docSnap.exists()) {
        displayProfile(docSnap.data());
      } else {
        showSection(profileSection);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      fullName: document.getElementById("fullName").value,
      age: document.getElementById("age").value,
      phone: document.getElementById("phone").value,
      license: document.getElementById("license").value,
      experience: document.getElementById("experience").value,
      vehicleType: document.getElementById("vehicleType").value,
      joinDate: new Date().toLocaleDateString(),
      profileImage: imagePreview.src || "https://via.placeholder.com/150"
    };

    try {
      await setDoc(doc(db, "drivers", currentUserId), formData);
      alert("Profile saved!");
      displayProfile(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  });

  profileImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      imagePreview.src = event.target.result;
      displayProfileImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  function displayProfile(data) {
    document.getElementById("displayName").textContent = data.fullName || "";
    document.getElementById("displayPhone").textContent = data.phone || "";
    document.getElementById("displayLicense").textContent = data.license || "";
    document.getElementById("displayAge").textContent = `${data.age || ""} years`;
    document.getElementById("displayExperience").textContent = `${data.experience || ""} years experience`;
    document.getElementById("displayVehicle").textContent = data.vehicleType || "";
    document.getElementById("displayJoinDate").textContent = `Joined: ${data.joinDate || ""}`;
    displayProfileImage.src = data.profileImage || "https://via.placeholder.com/150";
    imagePreview.src = data.profileImage || "https://via.placeholder.com/150";
    showSection(profileDisplaySection);
  }

  homeBtn.addEventListener("click", () => {
    showSection(overviewSection);
    updateActiveButton(homeBtn);
  });

  profileBtn.addEventListener("click", () => {
    loadProfileData(currentUserId);
    updateActiveButton(profileBtn);
  });

  startDrivingBtn.addEventListener("click", () => {
    window.location.href = "driver_availability.html";
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });

  editProfileBtn.addEventListener("click", () => {
    showSection(profileSection);
  });

  viewTripsBtn.addEventListener("click", () => {
    showSection(overviewSection);
  });

  function showSection(section) {
    [overviewSection, profileSection, profileDisplaySection].forEach((sec) => {
      sec.style.display = "none";
    });
    section.style.display = "block";
    section.classList.add("fade-in");
  }

  function updateActiveButton(activeBtn) {
    document.querySelectorAll(".nav-button").forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  }
  if (window.location.hash === "#overview") {
    showSection(overviewSection);
    updateActiveButton(homeBtn);
  }
});
