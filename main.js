// @ts-check
// filepath: /E:/Code/HTML_CSS_JS/edu/main.js

// Study hour goals for each subject
const studyTargets = {
  Science: {
    "Bangla 1st": 30,
    "Bangla 2nd": 25,
    "English 1st": 20,
    "English 2nd": 30,
    ICT: 10,
    Math: 20,
    "Higher Math": 30,
    Physics: 30,
    Chemistry: 25,
    Biology: 30,
    BGS: 25,
    Religion: 30,
  },
  Commerce: {
    "Bangla 1st": 30,
    "Bangla 2nd": 25,
    "English 1st": 20,
    "English 2nd": 30,
    ICT: 10,
    Math: 20,
    Religion: 30,
    "Finance and Banking": 30,
    Accounting: 25,
    "Business Entrepreneurship": 20,
    "General Science": 30,
    Agriculture: 25,
  },
};

// Get current date
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

// Initialize local storage
let studyProgress = JSON.parse(localStorage.getItem("studyProgress")) || {};
let dailyStudy = JSON.parse(localStorage.getItem("dailyStudy")) || {};
let previousWeeksData = JSON.parse(localStorage.getItem("previousWeeksData")) || [];
let carryOverHours = JSON.parse(localStorage.getItem("carryOver")) || 0;
let currentDate = getCurrentDate();
let studentGroup = localStorage.getItem("studentGroup") || null;

// Track start date for weekly reset
let startDate = localStorage.getItem("startDate");
if (!startDate) {
  startDate = currentDate;
  localStorage.setItem("startDate", startDate);
}

// Function to reset weekly data
function weeklyReset() {
  const today = new Date();
  const start = new Date(startDate);
  const difference = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  if (difference >= 7) {
    previousWeeksData.push({ startDate, dailyStudy });
    localStorage.setItem("previousWeeksData", JSON.stringify(previousWeeksData));

    // Reset current week data
    dailyStudy = {};
    localStorage.setItem("dailyStudy", JSON.stringify(dailyStudy));
    
    // Update start date for next week
    startDate = getCurrentDate();
    localStorage.setItem("startDate", startDate);

    updateChart(); // Refresh chart
  }
}

// Show current date
document.getElementById("currentDate").innerText = `Today's Date: ${currentDate}`;

// Function to generate subject input fields
function generateSubjectFields(group) {
  const subjectsDiv = document.getElementById("subjects");
  subjectsDiv.innerHTML = "";

  Object.keys(studyTargets[group]).forEach((subject) => {
    let div = document.createElement("div");
    div.classList.add("subject-item");

    div.innerHTML = `
      <span>${subject} (Goal: ${studyTargets[group][subject]}h)</span>
      <input type="number" id="${subject}" value="${studyProgress[subject] || ""}" placeholder="Hours" min="0">
      <button class="plus-btn" onclick="addMinutes('${subject}', 30)">➕</button>
    `;

    subjectsDiv.appendChild(div);
  });
}

// Select group
function selectGroup() {
  studentGroup = localStorage.getItem("studentGroup");
  if (!studentGroup) {
    studentGroup = prompt("Enter your group (Science or Commerce):");
    if (studentGroup && (studentGroup.toLowerCase() === "science" || studentGroup.toLowerCase() === "commerce")) {
      studentGroup = studentGroup.charAt(0).toUpperCase() + studentGroup.slice(1).toLowerCase();
      localStorage.setItem("studentGroup", studentGroup);
      generateSubjectFields(studentGroup);
    } else {
      alert("Invalid group. Please enter 'Science' or 'Commerce'.");
      selectGroup();
    }
  } else {
    generateSubjectFields(studentGroup);
  }
}

// If no entry for today, create one
if (!dailyStudy[currentDate]) {
  dailyStudy[currentDate] = 0;
}

// Call functions on page load
selectGroup();
weeklyReset();

// Convert minutes to hours
function addMinutes(subject, minutes) {
  let inputField = document.getElementById(subject);
  let currentHours = parseFloat(inputField.value) || 0;
  let newHours = currentHours + minutes / 60;
  inputField.value = newHours.toFixed(2);
}

// Save progress
function saveProgress() {
  let totalStudy = 0;
  let totalTarget = 8.25;
  let allSubjectsCompleted = true;

  Object.keys(studyTargets[studentGroup]).forEach((subject) => {
    let inputVal = parseFloat(document.getElementById(subject).value) || 0;
    studyProgress[subject] = inputVal;
    totalStudy += inputVal;

    if (inputVal < studyTargets[studentGroup][subject] - 5) {
      allSubjectsCompleted = false;
    }
  });

  // Check if study goal is met
  if (totalStudy < totalTarget) {
    let deficit = totalTarget - totalStudy;
    alert(`You missed ${deficit.toFixed(2)} hours today! This will be added to tomorrow's goal.`);
    carryOverHours += deficit;
  }

  // Save data
  dailyStudy[currentDate] = totalStudy;
  localStorage.setItem("dailyStudy", JSON.stringify(dailyStudy));
  localStorage.setItem("carryOver", JSON.stringify(carryOverHours));
  localStorage.setItem("studyProgress", JSON.stringify(studyProgress));

  let resultText = "Your predicted grade: ";
  resultText += allSubjectsCompleted ? "🎖️ Golden A+" : "🏅 A+";

  document.getElementById("result").innerText = resultText;

  updateChart();
}

// Reset progress
function resetProgress() {
  const confirmation = confirm("Are you sure you want to reset your progress?");
  if (confirmation) {
    localStorage.clear();
    location.reload();
  }
}
  

// Create Chart.js bar chart
const ctx = document.getElementById("studyChart").getContext("2d");
let studyChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: Object.keys(dailyStudy),
    datasets: [
      {
        label: "Hours Studied",
        data: Object.values(dailyStudy),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: { y: { beginAtZero: true, max: 100 } },
  },
});

// Update chart with new data
function updateChart() {
  studyChart.data.labels = Object.keys(dailyStudy);
  studyChart.data.datasets[0].data = Object.values(dailyStudy);
  studyChart.update();
}
