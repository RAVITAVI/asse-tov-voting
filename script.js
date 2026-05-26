const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');
const backToGenderBtn = document.getElementById('backToGenderBtn');

// רשימת בתי הספר המובנית בקוד
const SCHOOLS_DATA = [
    { schoolName: "סגולה", gender: "Female" },
    { schoolName: "אולפנת אמית חיפה", gender: "Female" },
    { schoolName: "אולפנת אמית שחר", gender: "Female" },
    { schoolName: "אולפנת שחם", gender: "Female" },
    { schoolName: "צביה", gender: "Female" },
    { schoolName: "אולפנת חריש", gender: "Female" },
    { schoolName: "לינסון בנות", gender: "Female" },
    { schoolName: "אולפנת אמונה אלישבע", gender: "Female" },
    { schoolName: "פלך זכרון יעקב", gender: "Female" },
    { schoolName: "ישיבה תנ\"כית זכרון יעקב", gender: "Male" },
    { schoolName: "ישיבה תיכונית קרית אתא", gender: "Male" },
    { schoolName: "יבנה", gender: "Male" },
    { schoolName: "לינסון בנים", gender: "Male" },
    { schoolName: "נתיבות דרור", gender: "Male" },
    { schoolName: "ישיבת בנ\"ע - חריש", gender: "Male" },
    { schoolName: "ישיבה תיכונית פרדס חנה כרכור", gender: "Male" }
];

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

function loadSchools(genderParam) {
    schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
    const filteredSchools = SCHOOLS_DATA.filter(item => item.gender === genderParam);
    
    filteredSchools.forEach(school => {
        const option = document.createElement("option");
        option.value = school.schoolName;
        option.innerText = school.schoolName;
        schoolDropdown.appendChild(option);
    });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "באיזה בית ספר אתה לומד?";
    loadSchools("Male");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "באיזה בית ספר את לומדת?";
    loadSchools("Female");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

// פונקציונליות כפתור חזור
backToGenderBtn.addEventListener('click', () => {
    schoolScreen.classList.remove('active');
    genderScreen.classList.add('active');
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
