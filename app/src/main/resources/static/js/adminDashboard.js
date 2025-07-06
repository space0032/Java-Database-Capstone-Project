/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form


  Attach a click listener to the "Add Doctor" button
  When clicked, it opens a modal form using openModal('addDoctor')


  When the DOM is fully loaded:
    - Call loadDoctorCards() to fetch and display all doctors


  Function: loadDoctorCards
  Purpose: Fetch all doctors and display them as cards

    Call getDoctors() from the service layer
    Clear the current content area
    For each doctor returned:
    - Create a doctor card using createDoctorCard()
    - Append it to the content div

    Handle any fetch errors by logging them


  Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
  On any input change, call filterDoctorsOnChange()


  Function: filterDoctorsOnChange
  Purpose: Filter doctors based on name, available time, and specialty

    Read values from the search bar and filters
    Normalize empty values to null
    Call filterDoctors(name, time, specialty) from the service

    If doctors are found:
    - Render them using createDoctorCard()
    If no doctors match the filter:
    - Show a message: "No doctors found with the given filters."

    Catch and display any errors with an alert


  Function: renderDoctorCards
  Purpose: A helper function to render a list of doctors passed to it

    Clear the content area
    Loop through the doctors and append each card to the content area


  Function: adminAddDoctor
  Purpose: Collect form data and add a new doctor to the system

    Collect input values from the modal form
    - Includes name, email, phone, password, specialty, and available times

    Retrieve the authentication token from localStorage
    - If no token is found, show an alert and stop execution

    Build a doctor object with the form values

    Call saveDoctor(doctor, token) from the service

    If save is successful:
    - Show a success message
    - Close the modal and reload the page

    If saving fails, show an error message
*/

// adminDashboard.js

import { openModal } from './components/modals.js';
import { getDoctors, filterDoctors, saveDoctor } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';

const contentDiv = document.getElementById('content');
const searchBar = document.getElementById('searchBar');
const filterTime = document.getElementById('filterTime');
const filterSpecialty = document.getElementById('filterSpecialty');
const addDoctorBtn = document.getElementById('addDocBtn');

// Open Add Doctor Modal on button click
addDoctorBtn.addEventListener('click', () => {
  openModal('addDoctor');
});

// Load all doctors and render cards on page load
window.addEventListener('DOMContentLoaded', loadDoctorCards);

/**
 * Fetch all doctors and render them as cards
 */
async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (error) {
    console.error("Error loading doctors:", error);
  }
}

/**
 * Render a list of doctor cards in the content area
 * @param {Array} doctors - List of doctor objects
 */
function renderDoctorCards(doctors) {
  contentDiv.innerHTML = ''; // Clear existing content

  if (!doctors || doctors.length === 0) {
    contentDiv.innerHTML = '<p>No doctors found.</p>';
    return;
  }

  doctors.forEach(doctor => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });
}

// Attach filter event listeners to inputs
searchBar.addEventListener('input', filterDoctorsOnChange);
filterTime.addEventListener('change', filterDoctorsOnChange);
filterSpecialty.addEventListener('change', filterDoctorsOnChange);

/**
 * Filter doctors based on input values and render results
 */
async function filterDoctorsOnChange() {
  // Get input values, normalize empty strings to null
  const name = searchBar.value.trim() || null;
  const time = filterTime.value || null;
  const specialty = filterSpecialty.value || null;

  try {
    const doctors = await filterDoctors(name, time, specialty);

    if (doctors && doctors.length > 0) {
      renderDoctorCards(doctors);
    } else {
      contentDiv.innerHTML = '<p>No doctors found with the given filters.</p>';
    }
  } catch (error) {
    console.error("Error filtering doctors:", error);
    alert("Failed to filter doctors. Please try again.");
  }
}

/**
 * Collects form data from the Add Doctor modal and submits it to the backend
 */
export async function adminAddDoctor() {
  try {
    // Get input values from modal form
    const name = document.getElementById('doctorName').value.trim();
    const email = document.getElementById('doctorEmail').value.trim();
    const phone = document.getElementById('doctorPhone').value.trim();
    const password = document.getElementById('doctorPassword').value;
    const specialty = document.getElementById('specialization').value;

    // Collect selected availability checkboxes
    const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]:checked');
    const availability = Array.from(availabilityCheckboxes).map(cb => cb.value);

    // Retrieve token from localStorage for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in as admin to add a doctor.");
      return;
    }

    // Build doctor object
    const doctor = {
      name,
      email,
      phone,
      password,
      specialty,
      availability
    };

    // Call saveDoctor API service
    const response = await saveDoctor(doctor, token);

    if (response.success) {
      alert("Doctor added successfully!");
      document.getElementById('modal').style.display = 'none';  // Close modal
      await loadDoctorCards(); // Reload doctor list
    } else {
      alert(`Failed to add doctor: ${response.message}`);
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    alert("An error occurred while adding the doctor. Please try again.");
  }
}
