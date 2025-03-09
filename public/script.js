// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

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

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

    // 2. Reference a path in your database (e.g. "names")
    const namesRef = database.ref("names");

    // 3. Listen for form submission and push the new name to the database
    document.getElementById("nameForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const nameInput = document.getElementById("nameInput");
      const nameValue = nameInput.value.trim();

      if(nameValue) {
        // Push the new name into the "names" list in Firebase
        namesRef.push(nameValue);
        nameInput.value = ""; // clear the input
      }
    });

    // 4. Listen for changes in the "names" data and update the list
    namesRef.on("value", (snapshot) => {
      const namesList = document.getElementById("namesList");
      namesList.innerHTML = ""; // clear current list

      // Snapshot gives you a key/value map of everything under "names"
      const data = snapshot.val();
      if(data) {
        // Convert each item into a list element
        Object.keys(data).forEach((key) => {
          const listItem = document.createElement("li");
          listItem.textContent = data[key];
          namesList.appendChild(listItem);
        });
      }
    });