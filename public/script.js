

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
  import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const namesRef = ref(database, "names");


document.getElementById("nameForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const nameInput = document.getElementById("nameInput");
  const nameValue = nameInput.value.trim();

  if (nameValue) 
  {
    push(namesRef, nameValue);
    nameInput.value = ""; 
  }
});

onValue(namesRef, (snapshot) => {
  const data = snapshot.val();
  const namesList = document.getElementById("namesList");
  namesList.innerHTML = ""; 
  
  if (data) {
    Object.keys(data).forEach((key) => {
      const listItem = document.createElement("li");
      listItem.textContent = data[key];
      namesList.appendChild(listItem);
    });
  }
});
