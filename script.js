// מסכים
const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const nameScreen = document.getElementById('name-screen');

// אלמנטים
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const studentNameInput = document.getElementById('student-name-input');

// כפתורים
const nextBtn = document.getElementById('nextBtn');
const submitNameBtn = document.getElementById('submitNameBtn');
const backToGenderBtn = document.getElementById('backToGenderBtn');
const backToSchoolBtn = document.getElementById('backToSchoolBtn');

// משתנים גלובליים - כאן אנחנו שומרים את הבחירות של התלמיד כדי שיעברו בין המסכים!
let selectedGender = "";
let selectedSchool = "";
let studentName = "";

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
    selectedGender = "בן"; // שומר את המגדר שנבחר
    schoolQuestion.innerText = "באיזה בית ספר אתה לומד?";
    loadSchools("Male");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    selectedGender = "בת"; // שומר את המגדר שנבחר
    schoolQuestion.innerText = "באיזה בית ספר את לומדת?";
    loadSchools("Female");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

backToGenderBtn.addEventListener('click', () => {
    schoolScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

// לוגיקת כפתור המשך של מסך בית הספר
nextBtn.addEventListener('click', () => {
    if (schoolDropdown.value === "") {
        alert("אנא בחר בית ספר לפני ההמשך");
    } else {
        // שומרים את שם בית הספר שנבחר לתוך המשתנה הכללי (לצורך סינונים עתידיים)
        selectedSchool = schoolDropdown.value; 
        
        console.log("בית הספר שנבחר ונשמר בזיכרון:", selectedSchool); // בדיקת פיתוח מאחורי הקלעים
        
        // מעבר למסך הבא (שם)
        schoolScreen.classList.remove('active');
        nameScreen.classList.add('active');
        studentNameInput.focus();
    }
});

// כפתור חזור ממסך השם למסך בית ספר
backToSchoolBtn.addEventListener('click', () => {
    nameScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

// כפתור המשך ממסך הקלדת שם
submitNameBtn.addEventListener('click', () => {
    const trimmedName = studentNameInput.value.trim();
    if (trimmedName === "") {
        alert("אנא הקלד/י את שמך לפני ההמשך");
    } else {
        studentName = trimmedName;
        alert(`נתונים זמניים שנשמרו:\nמגדר: ${selectedGender}\nבית ספר: ${selectedSchool}\nשם: ${studentName}`);
    }
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
