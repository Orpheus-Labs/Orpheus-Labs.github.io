// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyCfCb8utQHEhXTdedeVRuRnAmn05pynnvI",

  authDomain: "orpheus-labs.firebaseapp.com",

  databaseURL: "https://orpheus-labs-default-rtdb.firebaseio.com",

  projectId: "orpheus-labs",

  storageBucket: "orpheus-labs.firebasestorage.app",

  messagingSenderId: "377253640127",

  appId: "1:377253640127:web:bf7f6ec3ada3dbb003530a",

  measurementId: "G-SL4CYNVLHV"

};


// Initialize Firebase

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Get a reference to your Realtime Database
const database = getDatabase(app);
const namesRef = ref(database, "names");

// 3. Listen for form submission, push new name
document.getElementById("nameForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const nameInput = document.getElementById("nameInput");
  const nameValue = nameInput.value.trim();

  if (nameValue) {
    // 'push' a new child under 'names'
    push(namesRef, nameValue);
    nameInput.value = ""; // clear the input
  }
});

// 4. Listen for changes and update the UL
onValue(namesRef, (snapshot) => {
  const namesList = document.getElementById("namesList");
  namesList.innerHTML = ""; // clear current list

  const data = snapshot.val();
  if (data) {
    // data is an object with unique push keys -> name
    // Convert each item into a list element
    Object.keys(data).forEach((key) => {
      const listItem = document.createElement("li");
      listItem.textContent = data[key];
      namesList.appendChild(listItem);
    });
  }
});