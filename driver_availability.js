import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    vehicleForm: document.getElementById('vehicleForm'),
    addRouteBtn: document.getElementById('addRouteBtn'),
    routeModal: document.getElementById('addRouteModal'),
    routeForm: document.getElementById('routeForm'),
    cancelRouteBtn: document.getElementById('cancelRoute'),
    closeModalBtn: document.querySelector('.close-modal'),
    availabilityToggle: document.getElementById('availabilityToggle'),
    statusText: document.getElementById('statusText'),
    routeChips: document.getElementById('routeChips'),
    bookingsGrid: document.getElementById('bookingsGrid'),
    noBookingsMessage: document.getElementById('noBookingsMessage'),
    logoutBtn: document.getElementById('logoutBtn'),
    homeBtn: document.getElementById('homeBtn'),
    profileBtn: document.getElementById('profileBtn'),
    availabilityBtn: document.getElementById('availabilityBtn'),
    vehicleDetailsSection: document.getElementById('vehicleDetailsSection'),
    bookingsSection: document.getElementById('bookingsSection'),
    availabilitySection: document.querySelector('.availability-section'),
  };

  // Firebase auth check
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const uid = user.uid;

    await loadAvailability(uid);
    await loadSavedRoutes(uid);
    await loadVehicleDetails(uid);

    // Driver Status Toggle
    elements.availabilityToggle.addEventListener('change', async (e) => {
      const isAvailable = e.target.checked;
      elements.statusText.textContent = isAvailable ? "Available for Trips" : "Currently Offline";
      elements.statusText.className = isAvailable ? "status-text online" : "status-text offline";

      await setDoc(doc(db, "driverAvailability", uid), {
        available: isAvailable,
        updatedAt: new Date()
      });
    });

    elements.vehicleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const vehicle = {
    regNumber: document.getElementById('regNumber').value,
    modelYear: document.getElementById('modelYear').value,
    loadCapacity: document.getElementById('loadCapacity').value,
    dimensions: {
      length: document.getElementById('length').value,
      width: document.getElementById('width').value,
      height: document.getElementById('height').value
    },
    notes: document.getElementById('vehicleNotes').value,
    updatedAt: new Date()
  };
  await setDoc(doc(db, "vehicleDetails", uid), vehicle);
  alert("Vehicle details saved.");
});


    // Route Modal Handling
    elements.addRouteBtn.addEventListener('click', () => elements.routeModal.style.display = 'block');
    elements.cancelRouteBtn.addEventListener('click', () => elements.routeModal.style.display = 'none');
    elements.closeModalBtn.addEventListener('click', () => elements.routeModal.style.display = 'none');

    // Add New Route
    elements.routeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const from = document.getElementById('fromCity').value.trim();
      const to = document.getElementById('toCity').value.trim();
      if (!from || !to) return;

      const route = `${from} - ${to}`;
      addRouteChip(route);
      await saveRoutes(uid);
      elements.routeModal.style.display = 'none';
      e.target.reset();
    });

    // Remove Route
    elements.routeChips.addEventListener('click', async (e) => {
      if (e.target.closest('.remove-route')) {
        e.target.closest('.route-chip').remove();
        await saveRoutes(uid);
      }
    });

    // Navigation
    elements.homeBtn.addEventListener('click', () => showSection('availability'));
    elements.profileBtn.addEventListener('click', () => showSection('vehicle'));
    elements.availabilityBtn.addEventListener('click', () => showSection('bookings'));
    elements.logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'login.html';
      });
    });
  });

  // UI Section Switching
  function showSection(name) {
    elements.availabilitySection.style.display = 'none';
    elements.vehicleDetailsSection.style.display = 'none';
    elements.bookingsSection.style.display = 'none';

    if (name === 'availability') {
      elements.availabilitySection.style.display = 'block';
    } else if (name === 'vehicle') {
      elements.vehicleDetailsSection.style.display = 'block';
    } else if (name === 'bookings') {
      elements.bookingsSection.style.display = 'block';
    }
  }

  // Loaders
  async function loadAvailability(uid) {
    const snap = await getDoc(doc(db, "driverAvailability", uid));
    if (snap.exists()) {
      const { available } = snap.data();
      elements.availabilityToggle.checked = available;
      elements.statusText.textContent = available ? "Available for Trips" : "Currently Offline";
      elements.statusText.className = available ? "status-text online" : "status-text offline";
    }
  }

  async function loadSavedRoutes(uid) {
    const snap = await getDoc(doc(db, "driverRoutes", uid));
    if (snap.exists()) {
      const { routes } = snap.data();
      routes.forEach(addRouteChip);
    }
  }

  async function loadVehicleDetails(uid) {
    const snap = await getDoc(doc(db, "vehicleDetails", uid));
    if (snap.exists()) {
      const d = snap.data();
      document.getElementById('regNumber').value = d.regNumber || '';
      document.getElementById('modelYear').value = d.modelYear || '';
      document.getElementById('loadCapacity').value = d.loadCapacity || '';
      document.getElementById('length').value = d.dimensions?.length || '';
      document.getElementById('width').value = d.dimensions?.width || '';
      document.getElementById('height').value = d.dimensions?.height || '';
      document.getElementById('vehicleNotes').value = d.notes || '';
    }
  }

  async function saveRoutes(uid) {
    const routes = Array.from(document.querySelectorAll('.route-chip span'))
      .map(span => span.textContent);
    await setDoc(doc(db, "driverRoutes", uid), { routes, updatedAt: new Date() });
  }

  function addRouteChip(routeText) {
    const chip = document.createElement('div');
    chip.className = 'route-chip';
    chip.innerHTML = `
      <span>${routeText}</span>
      <button class="remove-route"><i class="fas fa-times"></i></button>
    `;
    elements.routeChips.insertBefore(chip, elements.addRouteBtn);
  }
});
