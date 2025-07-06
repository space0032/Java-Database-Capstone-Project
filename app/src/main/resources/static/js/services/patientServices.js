// patientServices.js
import { API_BASE_URL } from "../config/config.js";

const PATIENT_API = API_BASE_URL + '/patient';

/**
 * Registers a new patient
 * @param {Object} data - Patient details for signup
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function patientSignup(data) {
  try {
    const response = await fetch(`${PATIENT_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error("Error :: patientSignup :: ", error);
    return { success: false, message: error.message };
  }
}

/**
 * Logs in a patient
 * @param {Object} data - Login credentials (email, password)
 * @returns {Promise<Response>} - The fetch response (to handle status, token, etc.)
 */
export async function patientLogin(data) {
  console.log("patientLogin :: ", data); // Remove or comment out in production
  return await fetch(`${PATIENT_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

/**
 * Fetches patient data by auth token
 * @param {string} token - Patient auth token
 * @returns {Promise<Object|null>} Patient object or null on failure
 */
export async function getPatientData(token) {
  try {
    const response = await fetch(`${PATIENT_API}/${token}`);
    const data = await response.json();

    if (response.ok) {
      return data.patient;
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return null;
  }
}

/**
 * Fetches appointments for patient or doctor dashboards
 * @param {string} id - Patient ID
 * @param {string} token - Auth token
 * @param {string} user - "patient" or "doctor"
 * @returns {Promise<Array|null>} Array of appointments or null on failure
 */
export async function getPatientAppointments(id, token, user) {
  try {
    const response = await fetch(`${PATIENT_API}/${id}/${user}/${token}`);
    const data = await response.json();

    if (response.ok) {
      return data.appointments;
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return null;
  }
}

/**
 * Filters appointments by condition and patient name
 * @param {string} condition - Filter condition (e.g., pending, consulted)
 * @param {string} name - Patient name or other search parameter
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Object containing filtered appointments array
 */
export async function filterAppointments(condition, name, token) {
  try {
    const response = await fetch(`${PATIENT_API}/filter/${condition}/${name}/${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch appointments:", response.statusText);
      return { appointments: [] };
    }
  } catch (error) {
    console.error("Error filtering appointments:", error);
    alert("Something went wrong!");
    return { appointments: [] };
  }
}
