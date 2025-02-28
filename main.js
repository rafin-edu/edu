// Study hour goals for each subject
const studyTargets = {
    "Bangla 1st": 30,
    "Bangla 2nd": 25,
    "English 1st": 25,
    "English 2nd": 30,
    "ICT": 10,
    "Math": 25,
    "Higher Math": 30,
    "Physics": 30,
    "Chemistry": 25,
    "Biology": 30,
    "BGS": 35,
    "Islam": 35,
    "Religion": 25
};

// Get current date (live time tracking)
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

// Store progress in localStorage
let studyProgress = JSON.parse(localStorage.getItem("studyProgress")) || {};
let dailyStudy = JSON.parse(localStorage.getItem("dailyStudy")) || {};
let carryOverHours = JSON.parse(localStorage.getItem("carryOver")) || 0;
let currentDate = getCurrentDate();

// Show current date
document.getElementById("currentDate").innerText = `Today's Date: ${currentDate}`;

// If no entry for today, create one
if (!dailyStudy[currentDate]) {
    dailyStudy[currentDate] = 0;
}

// Generate input fields dynamically
const subjectsDiv = document.getElementById("subjects");

Object.keys(studyTargets).forEach(subject => {
    let div = document.createElement("div");
    div.classList.add("subject-item");

    div.innerHTML = `
        <span>${subject} (Goal: ${studyTargets[subject]}h)</span>
        <input type="number" id="${subject}" value="${studyProgress[subject] || ''}" placeholder="Hours" min="0">
        <button class="plus-btn" onclick="addMinutes('${subject}', 30)">➕</button>
    `;

    subjectsDiv.appendChild(div);
});

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
    let totalTarget = 8.25 ;
    let allSubjectsCompleted = true;

    // Sum the study hours for each subject
    Object.keys(studyTargets).forEach(subject => {
        let inputVal = parseFloat(document.getElementById(subject).value) || 0;
        studyProgress[subject] = inputVal;
        totalStudy += inputVal;

        if (inputVal < studyTargets[subject] - 5) {
            allSubjectsCompleted = false;
        }
    });

    // Check if study goal is met
    if (totalStudy < totalTarget) {
        let deficit = totalTarget - totalStudy;
        alert(`You missed ${deficit.toFixed(2)} hours today! This will be added to tomorrow's goal.`);
        carryOverHours += deficit; // Add to next day's goal
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
    localStorage.clear();
    location.reload();
}

// Create Chart.js bar chart
const ctx = document.getElementById("studyChart").getContext("2d");
let studyChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: Object.keys(dailyStudy),
        datasets: [{
            label: "Hours Studied",
            data: Object.values(dailyStudy),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
        }]
    },
    options: {
        scales: { y: { beginAtZero: true, max: 10 } }
    }
});

// Update chart with new data
function updateChart() {
    studyChart.data.labels = Object.keys(dailyStudy);
    studyChart.data.datasets[0].data = Object.values(dailyStudy);
    studyChart.update();
}