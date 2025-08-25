document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const loginBtn = document.getElementById("loginBtn");
  const exploreBtn = document.getElementById("exploreBtn");
  const loginModal = document.getElementById("loginModal");
  const closeLoginModal = loginModal?.querySelector(".close");
  const loginForm = document.getElementById("loginForm");
  const landingPage = document.getElementById("landingPage");
  const mainApp = document.getElementById("mainApp");
  const vehicleList = document.getElementById("vehicleList");
  const bookingModal = document.getElementById("bookingModal");
  const bookingForm = document.getElementById("bookingForm");
  const confirmBtn = bookingModal?.querySelector(".confirm-btn");
  const cancelBtn = bookingModal?.querySelector(".cancel-btn");
  const closeBookingModal = bookingModal?.querySelector(".close");
  const searchInput = document.getElementById("mainSearchInput") || document.getElementById("searchInput");
  const navLinks = document.getElementById("navLinks");
  const logoutBtn = document.getElementById("logoutBtn");
  const addVehicleBtn = document.getElementById("addVehicleBtn");
  const addVehicleModal = document.getElementById("addVehicleModal");
  const closeAddVehicleModal = addVehicleModal?.querySelector(".close");
  const addVehicleForm = document.getElementById("addVehicleForm");
  const vehicleTableBody = document.getElementById("vehicleTable").querySelector("tbody");
  const editVehicleModal = document.getElementById("editVehicleModal");
  const closeEditVehicleModal = editVehicleModal?.querySelector(".close");
  const editVehicleForm = document.getElementById("editVehicleForm");
  const viewDetailsModal = document.getElementById("viewDetailsModal");
  const closeViewDetailsModal = viewDetailsModal?.querySelector(".close");
  const vehicleDetailsContent = document.getElementById("vehicleDetailsContent");
  const sortVehiclesDropdown = document.getElementById("sortVehicles");
  const filterLocationInput = document.getElementById("filterLocation");

  let isLoggedIn = false; 
  let editingVehicleId = null;

  const vehicles = [
    { id: 1, name: "Truck A", licenseNumber: "ABC-1234", transportationCharge: 500, phone: "9635235265", driver: "Ajay", location: "Delhi" },
    { id: 2, name: "Truck B", licenseNumber: "XYZ-5678", transportationCharge: 450, phone: "6356956595", driver: "Pritam", location: "Moradabad" },
    { id: 3, name: "Truck C", licenseNumber: "LMN-9101", transportationCharge: 600, phone: "6398635626", driver: "Manish", location: "Bareilly"},
    { id: 4, name: "Truck D", licenseNumber: "PQR-1121", transportationCharge: 550, phone: "9837200784", driver: "Dev", location: "Shimla"}
  ];

  const toggleModal = (modal, show = true) => {
    if (!modal) return;
    modal.style.display = show ? "flex" : "none";
    if (show) modal.setAttribute("aria-hidden", "false");
    else modal.setAttribute("aria-hidden", "true");
  };

  const displayVehicles = (data) => {
    if (!vehicleList) return;
    const fragment = document.createDocumentFragment(); 
    data.forEach(vehicle => {
      const card = document.createElement("div");
      card.className = "vehicle-card";
      card.innerHTML = `
        <img src="${vehicle.imgSrc}" alt="${vehicle.name}" />
        <h3>${vehicle.name}</h3>
        <p><strong>License:</strong> ${vehicle.licenseNumber}</p>
        <p><strong>Charge:</strong> ₹${vehicle.transportationCharge}</p>
        <p><strong>Driver:</strong> ${vehicle.driver}</p>
        <p><strong>Phone:</strong> ${vehicle.phone}</p>
        <p><strong>Location:</strong> ${vehicle.location}</p>
        <button class="book-btn" data-id="${vehicle.id}">Click To Book</button>
      `;
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      fragment.appendChild(card);

       setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      }, 100);
    });
    vehicleList.innerHTML = ""; 
    vehicleList.appendChild(fragment); 
  };

  const displayVehicleList = (data) => {
    vehicleTableBody.innerHTML = ""; // Clear existing rows
    data.forEach((vehicle) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${vehicle.name}</td>
        <td>${vehicle.licenseNumber}</td>
        <td>₹${vehicle.transportationCharge}</td>
        <td>${vehicle.driver}</td>
        <td>${vehicle.phone}</td>
        <td>${vehicle.location}</td>
        <td>
          <button class="edit-btn" data-id="${vehicle.id}">Edit</button>
          <button class="delete-btn" data-id="${vehicle.id}">Delete</button>
          <button class="view-details-btn" data-id="${vehicle.id}">View Details</button>
        </td>
      `;
      vehicleTableBody.appendChild(row);
    });
  };

  const addVehicle = (vehicle) => {
    vehicles.push(vehicle);
    displayVehicleList(vehicles);
  };

  const bookVehicle = (id) => {
    if (mainApp.style.display !== "block") {
      alert("Please log in to book a vehicle.");
      return;
    }

  
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) {
      alert("Vehicle not found!");
      return;
    }

    const vehicleSelect = document.getElementById("vehicle");
    vehicleSelect.value = vehicle.name.toLowerCase();
    toggleModal(bookingModal, true);
  };

  const showSuccessMessage = (message, emoji) => {
    const successMessage = document.createElement("div");
    successMessage.className = "booking-success-message";
    successMessage.innerHTML = `
      <div class="emoji">${emoji}</div>
      <div class="message">${message}</div>
    `;
    document.body.appendChild(successMessage);

    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  };

  const showFeedbackMessage = (message, emoji) => {
    const feedbackMessage = document.createElement("div");
    feedbackMessage.className = "booking-feedback-message";
    feedbackMessage.innerHTML = `
      <div class="emoji">${emoji}</div>
      <div class="message">${message}</div>
    `;
    document.body.appendChild(feedbackMessage);

    setTimeout(() => {
      feedbackMessage.remove();
    }, 3000);
  };

  const showCenteredMessage = (message, emoji, type = "success") => {
    const messageBox = document.createElement("div");
    messageBox.className = `centered-message ${type}`;
    messageBox.innerHTML = `
      <div class="emoji">${emoji}</div>
      <div class="message">${message}</div>
    `;
    document.body.appendChild(messageBox);

    setTimeout(() => {
      messageBox.remove();
    }, 3000);
  };

  const switchToMainApp = () => {
    if (landingPage) landingPage.style.display = "none";
    if (mainApp) {
      mainApp.style.display = "block";
      if (navLinks) navLinks.style.display = "flex"; 
    }
  };

  const switchToLandingPage = () => {
    if (mainApp) mainApp.style.display = "none";
    if (landingPage) landingPage.style.display = "block";
    if (navLinks) navLinks.style.display = "none"; 
    isLoggedIn = false; 
  };

  let debounceTimeout;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const query = searchInput.value.toLowerCase();
        const filteredVehicles = vehicles.filter(v =>
          v.name.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query) ||
          v.licenseNumber.toLowerCase().includes(query)
        );
        displayVehicles(filteredVehicles);
      }, 300);     });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default behavior
      window.location.href = 'login.html'; // Redirect to login.html
    });
  }

  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      if (isLoggedIn) {
        switchToMainApp();
      } else {
          toggleModal(loginModal, true);
      }
    });
  }

  if (closeLoginModal) {
    closeLoginModal.addEventListener("click", () => toggleModal(loginModal, false));
  }

  if (closeBookingModal) {
    closeBookingModal.addEventListener("click", () => {
      bookingModal.style.display = "none";
    });
  }

  
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (mainApp.style.display !== "block") {
        alert("Please navigate to the vehicle booking page.");
        return;
      }
      bookingModal.style.display = "none";
      showCenteredMessage("Vehicle booked successfully!", "🎉", "success");
    });
  }

  // Handle Booking Cancellation
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      // Close the booking modal
      bookingModal.style.display = "none";

      // Show cancellation message
      showCenteredMessage("Booking canceled.", "😞", "cancel");
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === loginModal) toggleModal(loginModal, false);
  });

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent default form submission

      const role = document.getElementById("role").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Validate credentials
      if (username === "admin" && password === "password123") {
        isLoggedIn = true; // Set login status to true
        alert(`${role} login successful`);
        toggleModal(loginModal, false); // Close the login modal
        switchToMainApp(); // Switch to Page 2
        displayVehicles(vehicles); // Populate vehicle list
      } else {
        alert("Invalid credentials. Please try again.");
      }
    });
  }

  if (vehicleList) {
    vehicleList.addEventListener("click", (e) => {
      if (e.target.classList.contains("book-btn")) {
        const id = parseInt(e.target.dataset.id, 10);
        if (!isNaN(id)) {
          bookVehicle(id);
        }
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault(); 
      bookingModal.style.display = "none";
      showSuccessMessage("Vehicle booked successfully!", "😊");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      switchToLandingPage();
      localStorage.clear();
    });
  }

  // Handle Add Vehicle Modal
  if (addVehicleBtn) {
    addVehicleBtn.addEventListener("click", () => toggleModal(addVehicleModal, true));
  }

  if (closeAddVehicleModal) {
    closeAddVehicleModal.addEventListener("click", () => toggleModal(addVehicleModal, false));
  }

  // Handle Add Vehicle Form Submission
  if (addVehicleForm) {
    addVehicleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newVehicle = {
        id: vehicles.length + 1,
        name: document.getElementById("vehicleName").value,
        licenseNumber: document.getElementById("licenseNumber").value,
        transportationCharge: parseFloat(document.getElementById("charge").value),
        driver: document.getElementById("driver").value,
        phone: document.getElementById("phone").value,
        location: document.getElementById("location").value,
      };
      addVehicle(newVehicle);
      toggleModal(addVehicleModal, false);
      addVehicleForm.reset();
    });
  }

  // Handle Delete Vehicle
  vehicleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = parseInt(e.target.dataset.id, 10);
      const index = vehicles.findIndex((v) => v.id === id);
      if (index !== -1) {
        vehicles.splice(index, 1);
        displayVehicleList(vehicles);
      }
    }
  });

  // Open Edit Modal
  vehicleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const id = parseInt(e.target.dataset.id, 10);
      const vehicle = vehicles.find((v) => v.id === id);
      if (vehicle) {
        editingVehicleId = id;
        document.getElementById("editVehicleName").value = vehicle.name;
        document.getElementById("editLicenseNumber").value = vehicle.licenseNumber;
        document.getElementById("editCharge").value = vehicle.transportationCharge;
        document.getElementById("editDriver").value = vehicle.driver;
        document.getElementById("editPhone").value = vehicle.phone;
        document.getElementById("editLocation").value = vehicle.location;
        toggleModal(editVehicleModal, true);
      }
    }
  });

  // Close Edit Modal
  if (closeEditVehicleModal) {
    closeEditVehicleModal.addEventListener("click", () => toggleModal(editVehicleModal, false));
  }

  // Handle Edit Form Submission
  if (editVehicleForm) {
    editVehicleForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedVehicle = {
        id: editingVehicleId,
        name: document.getElementById("editVehicleName").value,
        licenseNumber: document.getElementById("editLicenseNumber").value,
        transportationCharge: parseFloat(document.getElementById("editCharge").value),
        driver: document.getElementById("editDriver").value,
        phone: document.getElementById("editPhone").value,
        location: document.getElementById("editLocation").value,
      };
      const index = vehicles.findIndex((v) => v.id === editingVehicleId);
      if (index !== -1) {
        vehicles[index] = updatedVehicle;
        displayVehicleList(vehicles);
        toggleModal(editVehicleModal, false);
      }
    });
  }

  // View Details Functionality
  vehicleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-details-btn")) {
      const id = parseInt(e.target.dataset.id, 10);
      const vehicle = vehicles.find((v) => v.id === id);
      if (vehicle) {
        vehicleDetailsContent.innerHTML = `
          <p><strong>Name:</strong> ${vehicle.name}</p>
          <p><strong>License Number:</strong> ${vehicle.licenseNumber}</p>
          <p><strong>Charge:</strong> ₹${vehicle.transportationCharge}</p>
          <p><strong>Driver:</strong> ${vehicle.driver}</p>
          <p><strong>Phone:</strong> ${vehicle.phone}</p>
          <p><strong>Location:</strong> ${vehicle.location}</p>
        `;
        toggleModal(viewDetailsModal, true);
      }
    }
  });

  // Close View Details Modal
  if (closeViewDetailsModal) {
    closeViewDetailsModal.addEventListener("click", () => toggleModal(viewDetailsModal, false));
  }

  // Sort Vehicles Functionality
  if (sortVehiclesDropdown) {
    sortVehiclesDropdown.addEventListener("change", () => {
      const sortBy = sortVehiclesDropdown.value;
      const sortedVehicles = [...vehicles].sort((a, b) => {
        if (sortBy === "charge") {
          return a.transportationCharge - b.transportationCharge;
        }
        return a[sortBy].localeCompare(b[sortBy]);
      });
      displayVehicleList(sortedVehicles);
    });
  }

  if (filterLocationInput) {
    filterLocationInput.addEventListener("input", () => {
      const query = filterLocationInput.value.toLowerCase();
      const filteredVehicles = vehicles.filter((v) =>
        v.location.toLowerCase().includes(query)
      );
      displayVehicleList(filteredVehicles);
    });
  }

  if (landingPage) landingPage.style.display = "block";
  if (mainApp) mainApp.style.display = "none";

  displayVehicles(vehicles);
  displayVehicleList(vehicles);

  setTimeout(() => {}, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  const mainLoginForm = document.getElementById("loginForm");
  const modalLoginForm = document.getElementById("modalLoginForm");
  const loginModal = document.getElementById("loginModal");

  // Handle modal login form submission
  if (modalLoginForm) {
    modalLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = document.getElementById("role").value;
      const username = document.getElementById("modalUsername").value;
      const password = document.getElementById("modalPassword").value;

      if (username === "admin" && password === "123456") {
        alert(`${role} login successful! Redirecting...`);
        loginModal.style.display = "none";

        if (role === "client") {
          window.location.href = "client_dashboard.html"; // Redirect to client page
        } else if (role === "driver") {
          window.location.href = "driver_dashboard.html"; // Redirect to driver page
        }
      } else {
        alert("Invalid credentials. Please try again.");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const landingPage = document.getElementById("landingPage");
  const mainApp = document.getElementById("mainApp");

  // Check if the user is logged in (you can use sessionStorage or localStorage for this)
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (isLoggedIn) {
    if (landingPage) landingPage.style.display = "none";
    if (mainApp) mainApp.style.display = "block";
  } else {
    if (landingPage) landingPage.style.display = "block";
    if (mainApp) mainApp.style.display = "none";
  }

  // Example: Set login status after successful login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sessionStorage.setItem("isLoggedIn", true);
      window.location.reload(); // Reload the page to show the mainApp section
    });
  }
});

function showSuccessPopup(message) {
  const popup = document.getElementById('successPopup');
  const popupMessage = document.getElementById('popupMessage');
  popupMessage.textContent = message;
  popup.classList.add('show');

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove('show');
  }, 3000);
}
