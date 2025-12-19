const firebaseConfig = {
    apiKey: "AIzaSyAbpBMm_zpny9e8xj9bgp6wNf4sND6ty38",
    authDomain: "mentalhealthtracker-8d8cf.firebaseapp.com",
    projectId: "mentalhealthtracker-8d8cf",
    storageBucket: "mentalhealthtracker-8d8cf.firebasestorage.app",
    messagingSenderId: "234371734335",
    appId: "1:234371734335:web:c36a4468a596119930918a",
    measurementId: "G-HRKMZRVRBF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const form = document.getElementById("checkup");
const pastEntries = document.getElementById("pastEntries");


loginBtn.addEventListener("click", async () => {
  try {
    console.log("Login clicked");
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    console.log("Login successful:", result.user);
    alert(`Logged in as ${result.user.displayName}`);
  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed, see console.");
  }
});

logoutBtn.addEventListener("click", () => auth.signOut());

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    form.style.display = "block";
    userInfo.textContent = `Logged in as ${user.displayName}`;
    loadPastEntries(user.uid);
  } else {
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    form.style.display = "none";
    userInfo.textContent = "";
    pastEntries.innerHTML = "";
  }
});

// Form submission
form.addEventListener("submit", async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Please log in first!");

  const feelingsChecked = Array.from(document.querySelectorAll('input[name="feelings"]:checked')).map(f => f.value);
  const copingChecked = Array.from(document.querySelectorAll('input[name="coping"]:checked')).map(c => c.value);

  await db.collection("checkins").add({
    uid: user.uid,
    Sleep: document.getElementById("Sleep").value,
    sleepQuality: document.getElementById("sleepQuality").value,
    Energy: document.getElementById("Energy").value,
    appetite: document.getElementById("food").value,
    mood: document.getElementById("mood").value,
    sad: document.getElementById("sad").value,
    stress: document.getElementById("stress").value,
    anxiety: document.getElementById("anxiety").value,
    motivation: document.getElementById("motivation").value,
    focus: document.getElementById("focus").value,
    social: document.getElementById("social").value,
    feelings: feelingsChecked,
    otherFeeling: document.getElementById("otherFeeling").value,
    coping: copingChecked,
    otherCoping: document.getElementById("otherCoping").value,
    otherSymptoms: document.getElementById("otherSymptoms").value,
    date: document.getElementById("date").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("Check-in submitted!");
  form.reset();
  loadPastEntries(user.uid);
});

// Load past entries
async function loadPastEntries(uid) {
  pastEntries.innerHTML = "";
  const snapshot = await db.collection("checkins")
    .where("uid", "==", uid)
    .orderBy("timestamp", "desc")
    .get();

  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.style.border = "1px solid gray";
    div.style.margin = "5px";
    div.style.padding = "5px";
    div.innerHTML = `
      <strong>Date:</strong> ${data.date}<br>
      <strong>Sleep:</strong> ${data.Sleep}h, Quality: ${data.sleepQuality}<br>
      <strong>Energy:</strong> ${data.Energy}<br>
      <strong>Appetite:</strong> ${data.appetite}<br>
      <strong>Mood:</strong> ${data.mood}<br>
      <strong>Hopeless/Depressed:</strong> ${data.sad}<br>
      <strong>Stress:</strong> ${data.stress}<br>
      <strong>Anxiety:</strong> ${data.anxiety}<br>
      <strong>Motivation:</strong> ${data.motivation}<br>
      <strong>Focus:</strong> ${data.focus}<br>
      <strong>Social:</strong> ${data.social}<br>
      <strong>Feelings:</strong> ${data.feelings.join(", ")}<br>
      <strong>Coping:</strong> ${data.coping.join(", ")}<br>
      <strong>Other Feeling:</strong> ${data.otherFeeling}<br>
      <strong>Other Coping:</strong> ${data.otherCoping}<br>
      <strong>Other Notes:</strong> ${data.otherSymptoms}<br>
    `;
    pastEntries.appendChild(div);
  });
}
