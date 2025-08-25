import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId = null;

// ---------------- Auth State Listener ----------------
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
  } else {
    currentUserId = user.uid;
    loadClientProfile(currentUserId);
  }
});

// ---------------- DOM Loaded ----------------
document.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById('homeBtn');
  const profileBtn = document.getElementById('profileBtn');
  const profileSection = document.getElementById('profileSection');
  const profileDisplaySection = document.getElementById('profileDisplaySection');
  const overviewSection = document.getElementById('overviewSection');
  const profileForm = document.getElementById('profileForm');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const viewOverviewBtn = document.getElementById('viewOverviewBtn');
  const profileImageInput = document.getElementById('profileImage');
  const imagePreviewContainer = document.querySelector('.image-preview');
  const bookVehicleBtn = document.getElementById('bookVehicleBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  initializeCityAutocomplete();

  if (profileDisplaySection) profileDisplaySection.style.display = 'none';
  if (overviewSection) overviewSection.style.display = 'none';

  const savedProfile = localStorage.getItem('clientProfile');
  if (savedProfile) {
    displayProfileData(JSON.parse(savedProfile));
  }

  homeBtn?.addEventListener('click', handleHomeClick);
  profileBtn?.addEventListener('click', handleProfileClick);
  profileForm?.addEventListener('submit', handleProfileSubmit);
  editProfileBtn?.addEventListener('click', handleEditProfile);
  viewOverviewBtn?.addEventListener('click', handleViewOverview);
  profileImageInput?.addEventListener('change', handleImageUpload);
  bookVehicleBtn?.addEventListener('click', handleBookVehicle);
  logoutBtn?.addEventListener('click', handleLogout);

  // ---------------- Functions ----------------
  function initializeCityAutocomplete() {
    const cityInput = document.getElementById('city');
    if (!cityInput) return;
    const suggestionBox = document.createElement('ul');
    suggestionBox.classList.add('autocomplete-suggestions');
    cityInput.parentNode.appendChild(suggestionBox);

    cityInput.addEventListener('input', async () => {
      const query = cityInput.value.trim();
      if (query.length < 2) {
        suggestionBox.innerHTML = '';
        return;
      }
      const apiKey = 'pk.a2d14cf707ab7c18f84026effa7468d9';
      const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        suggestionBox.innerHTML = '';
        if (Array.isArray(data)) {
          data.forEach(place => {
            const item = document.createElement('li');
            item.textContent = place.display_name;
            item.classList.add('autocomplete-item');
            item.addEventListener('click', () => {
              cityInput.value = place.display_name;
              suggestionBox.innerHTML = '';
            });
            suggestionBox.appendChild(item);
          });
        }
      } catch (err) {
        console.error('LocationIQ Error:', err);
      }
    });

    cityInput.addEventListener('blur', () => {
      setTimeout(() => { suggestionBox.innerHTML = ''; }, 100);
    });
  }

  function handleHomeClick() {
    hideAllSections();
    overviewSection.style.display = 'block';
    updateActiveButton(homeBtn);
  }

  function handleProfileClick() {
    const savedProfile = localStorage.getItem('clientProfile');
    hideAllSections();
    if (savedProfile) {
      profileDisplaySection.style.display = 'block';
      displayProfileData(JSON.parse(savedProfile));
    } else {
      profileSection.style.display = 'block';
    }
    updateActiveButton(profileBtn);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    try {
      const formData = {
        fullName: document.getElementById('fullName').value,
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        city: document.getElementById('city').value,
        joinDate: new Date().toLocaleDateString(),
        profileImage: await getProfileImageUrl(),
        sessionId: Math.random().toString(36).substr(2, 9),
        isLoggedIn: true
      };
      localStorage.setItem('clientProfile', JSON.stringify(formData));
      localStorage.setItem('authToken', formData.sessionId);
      sessionStorage.setItem('isActiveSession', 'true');

      if (currentUserId) {
        await setDoc(doc(db, 'clients', currentUserId), formData);
      }
      showSuccessMessage('Profile completed successfully!');
      displayProfileData(formData);
    } catch (error) {
      console.error('Error:', error);
      showErrorMessage('Error saving profile. Please try again.');
    }
  }

  function handleViewOverview() {
    hideAllSections();
    overviewSection.style.display = 'block';
    updateActiveButton(homeBtn);
  }

  function handleEditProfile() {
    const savedProfile = JSON.parse(localStorage.getItem('clientProfile'));
    if (savedProfile) {
      fillFormWithSavedData(savedProfile);
    }
    hideAllSections();
    profileSection.style.display = 'block';
  }

  function handleBookVehicle(e) {
    e.preventDefault();
    const clientProfile = JSON.parse(localStorage.getItem('clientProfile'));
    if (!clientProfile) {
      showErrorMessage('Please complete your profile before booking');
      return;
    }
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', 'client');
    localStorage.setItem('authToken', clientProfile.sessionId);
    sessionStorage.setItem('isActiveSession', 'true');
    sessionStorage.setItem('lastPage', 'profile');
    window.location.href = 'client_dashboard.html';
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
    sessionStorage.clear();
    localStorage.removeItem('clientProfile');
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  }

  function hideAllSections() {
    [profileSection, profileDisplaySection, overviewSection].forEach(sec => sec && (sec.style.display = 'none'));
  }

  function updateActiveButton(activeBtn) {
    [homeBtn, profileBtn].forEach(btn => btn?.classList.remove('active'));
    activeBtn?.classList.add('active');
  }

  function displayProfileData(profileData) {
    document.getElementById('displayProfileImage').src = profileData.profileImage || 'assets/default-avatar.png';
    document.getElementById('displayName').textContent = profileData.fullName || '';
    document.getElementById('displayEmail').textContent = profileData.email || '';
    document.getElementById('displayPhone').textContent = profileData.phone || '';
    document.getElementById('displayAge').textContent = profileData.age ? `${profileData.age} years` : '';
    document.getElementById('displayCity').textContent = profileData.city || '';
    document.getElementById('displayJoinDate').textContent = `Joined: ${profileData.joinDate || new Date().toLocaleDateString()}`;
    hideAllSections();
    profileDisplaySection.style.display = 'block';
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        imagePreviewContainer.style.display = 'block';
        imagePreviewContainer.innerHTML = `<img src="${ev.target.result}" alt="Profile Preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      showErrorMessage('Please select an image file');
    }
  }

  function showSuccessMessage(message) {
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success';
    successAlert.innerHTML = `<i class="fas fa-check-circle"></i>${message}`;
    profileSection.insertBefore(successAlert, profileForm);
    setTimeout(() => successAlert.remove(), 3000);
  }

  function showErrorMessage(message) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-error';
    errorAlert.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    profileSection.insertBefore(errorAlert, profileForm);
    setTimeout(() => errorAlert.remove(), 3000);
  }

  function fillFormWithSavedData(profileData) {
    document.getElementById('fullName').value = profileData.fullName;
    document.getElementById('age').value = profileData.age;
    document.getElementById('phone').value = profileData.phone;
    document.getElementById('email').value = profileData.email;
    document.getElementById('city').value = profileData.city;
  }

  async function getProfileImageUrl() {
    const profileImage = document.getElementById('profileImage').files[0];
    if (!profileImage) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(profileImage);
    });
  }

  // Expose to outside function
  window.displayProfileData = displayProfileData;
});

// ---------------- Load Client Profile ----------------
async function loadClientProfile(userId) {
  const docSnap = await getDoc(doc(db, 'clients', userId));
  if (docSnap.exists()) {
    const profileData = docSnap.data();
    localStorage.setItem('clientProfile', JSON.stringify(profileData));
    if (window.displayProfileData) {
      window.displayProfileData(profileData);
    }
  }
}
