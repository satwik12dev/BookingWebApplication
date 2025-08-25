import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  getDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById('home');
  const profileBtn = document.getElementById('profileBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const driverGrid = document.getElementById('driverGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchDriverBtn');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  let allDrivers = [];

  homeBtn?.addEventListener('click', () => {
    window.location.href = 'Client_Profile.html#overview';
  });

  profileBtn?.addEventListener('click', () => {
    window.location.href = 'client_profile.html';
  });

  logoutBtn?.addEventListener('click', () => {
    AuthManager.logout();
  });

  if (!AuthManager.checkAuth()) return;

  loadAvailableDrivers();

  async function loadAvailableDrivers() {
    try {
      const driverSnapshot = await getDocs(collection(db, 'drivers'));
      allDrivers = [];

      for (const docSnap of driverSnapshot.docs) {
        const driver = docSnap.data();
        const driverId = docSnap.id;

        // Check driver availability
        const availabilitySnap = await getDoc(doc(db, 'driverAvailability', driverId));
        const isAvailable = availabilitySnap.exists() && availabilitySnap.data().available;

        if (isAvailable) {
          // Load multiple routes if available
          let routes = ['N/A'];
          const routeSnap = await getDoc(doc(db, 'driverRoutes', driverId));
          if (routeSnap.exists()) {
            const routeData = routeSnap.data();
            if (Array.isArray(routeData.routes)) {
              routes = routeData.routes;
            }
          }

          allDrivers.push({
            id: driverId,
            ...driver,
            routes
          });
        }
      }

      displayDrivers(allDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      driverGrid.innerHTML = '<p>Error loading drivers.</p>';
    }
  }

  function displayDrivers(driverList) {
    if (!driverGrid) return;

    if (driverList.length === 0) {
      driverGrid.innerHTML = '<p>No matching drivers found.</p>';
      return;
    }

    driverGrid.innerHTML = driverList.map(driver => `
      <div class="driver-card">
        <img src="${driver.profileImage || 'assets/default-avatar.png'}" alt="${driver.fullName}" />
        <h3>${driver.fullName}</h3>
        <p><i class="fas fa-phone"></i> ${driver.phone || 'N/A'}</p>
        <p><i class="fas fa-truck"></i> ${driver.vehicleType || 'N/A'}</p>
        <p><i class="fas fa-road"></i> ${driver.experience || '0'}+ yrs experience</p>
        <p><i class="fas fa-city"></i> ${driver.city || 'Unknown'}</p>
        <p><i class="fas fa-route"></i> Routes:</p>
        <ul class="route-list">
          ${driver.routes.map(route => `<li>${route}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  searchBtn?.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      displayDrivers(allDrivers);
      return;
    }

    const filtered = allDrivers.filter(driver => {
      return (
        (driver.fullName?.toLowerCase().includes(query)) ||
        (driver.phone?.toLowerCase().includes(query)) ||
        (driver.city?.toLowerCase().includes(query)) ||
        (driver.vehicleType?.toLowerCase().includes(query)) ||
        (driver.routes?.some(route => route.toLowerCase().includes(query)))
      );
    });

    displayDrivers(filtered);
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchInput.value = '';
    displayDrivers(allDrivers);
  });
});

// Auth manager class
class AuthManager {
  static isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  static getUserType() {
    return localStorage.getItem('userType');
  }

  static logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
  }

  static checkAuth() {
    const isAuthenticated = this.isAuthenticated();
    const clientProfile = localStorage.getItem('clientProfile');
    const userType = this.getUserType();

    if (!isAuthenticated || !clientProfile || userType !== 'client') {
      this.logout();
      return false;
    }
    return true;
  }
}
