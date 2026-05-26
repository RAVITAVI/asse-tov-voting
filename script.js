const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');

// עדכני כאן את הכתובת שקיבלת מה-Deploy ב-Apps Script:
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwaCMudWkNY6U-ZNUUsRv6aaL5fDnYGMqxtxsreLILfWjDsL3vYwb6qWf8hw-nCDoju/exec";

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

function loadSchools(gender) {
    fetch(GOOGLE_SHEET_URL)
        .then(response => response.json())
        .then(data => {
            // מסננים לפי המגדר שנבחר בגיליון (נניח שרשום "בן" או "בת")
            const filteredSchools = data.filter(item => item.gender.trim() === gender);
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            filteredSchools.forEach(school => {
                const option = document.createElement("option");
                option.value = school.schoolName;
                option.innerText = school.schoolName;
                schoolDropdown.appendChild(option);
            });
        });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadSchools("בן"); // משנה ל-"בן" בהתאם לגיליון שלך
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadSchools("בת"); // משנה ל-"בת" בהתאם לגיליון שלך
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

nextBtn.addEventListener('click', () => {
    if (schoolDropdown.value === "") {
        alert("אנא בחר בית ספר לפני ההמשך");
    } else {
        alert("נבחר: " + schoolDropdown.value);
    }
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
