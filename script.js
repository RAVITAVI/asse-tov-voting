// מסכים
const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const nameScreen = document.getElementById('name-screen');

// אלמנטים
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const studentNameInput = document.getElementById('student-name-input');
const suggestionsContainer = document.getElementById('suggestions-container');

// כפתורים
const nextBtn = document.getElementById('nextBtn');
const submitNameBtn = document.getElementById('submitNameBtn');
const backToGenderBtn = document.getElementById('backToGenderBtn');
const backToSchoolBtn = document.getElementById('backToSchoolBtn');

// קישור בסיס הנתונים המרכזי בגוגל שיטס
const GOOGLE_SHEET_URL = "הדביקי_כאן_את_הקישור_הרגיל_של_הגיליון_מהדפדפן";

// משתנים גלובליים לשמירת נתוני התלמיד
let selectedGender = "";
let selectedSchool = "";
let studentName = "";
let allStudentsInSchool = []; // רשימת השמות המיועדת להשלמה האוטומטית
let isNameSelectedFromList = false; // משתנה בדיקה: האם התלמיד באמת בחר מהרשימה?

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

// פונקציה לשליפת תלמידים לפי בית ספר ומגדר מתוך גיליון "Students"
function fetchStudentsForSchool(schoolName, genderParam) {
    const matches = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches || !matches[1]) return;
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=Students`;

    fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
            const lines = text.split('\n');
            allStudentsInSchool = [];
            
            const targetGender = genderParam === "Male" ? "male" : "female";
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const columns = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
                
                const currentName = columns[1];   // עמודה B - שם מלא
                const currentSchool = columns[2]; // עמודה C - שם בית ספר
                const currentGender = columns[4]; // עמודה E - מגדר
                
                if (currentSchool === schoolName && currentGender && currentGender.toLowerCase() === targetGender) {
                    if (currentName) allStudentsInSchool.push(currentName);
                }
            }
            console.log("נטענו בהצלחה " + allStudentsInSchool.length + " תלמידים.");
        })
        .catch(error => console.error("שגיאה במשיכת רשימת התלמידים:", error));
}

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
    selectedGender = "Male";
    schoolQuestion.innerText = "באיזה בית ספר אתה לומד?";
    loadSchools("Male");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    selectedGender = "Female";
    schoolQuestion.innerText = "באיזה בית ספר את לומדת?";
    loadSchools("Female");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

backToGenderBtn.addEventListener('click', () => {
    schoolScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

nextBtn.addEventListener('click', () => {
    if (schoolDropdown.value === "") {
        alert("אנא בחר בית ספר לפני ההמשך");
    } else {
        selectedSchool = schoolDropdown.value; 
        fetchStudentsForSchool(selectedSchool, selectedGender);
        
        // איפוס נתונים ישנים במעבר למסך השם
        studentNameInput.value = "";
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = 'none';
        isNameSelectedFromList = false; // איפוס חובת הבחירה

        schoolScreen.classList.remove('active');
        nameScreen.classList.add('active');
        studentNameInput.focus();
    }
});

// לוגיקת השלמה אוטומטית (Autocomplete) במסך השם
studentNameInput.addEventListener('input', (e) => {
    const userInput = e.target.value.trim();
    suggestionsContainer.innerHTML = '';
    isNameSelectedFromList = false; // ברגע שהתלמיד מקליד או משנה משהו, הבחירה מתבטלת עד שילחץ שוב על פריט ברשימה
    
    if (userInput.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const filteredNames = allStudentsInSchool.filter(name => name.includes(userInput));

    if (filteredNames.length > 0) {
        suggestionsContainer.style.display = 'block';
        filteredNames.forEach(name => {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.innerText = name;
            
            div.addEventListener('click', () => {
                studentNameInput.value = name;
                suggestionsContainer.style.display = 'none';
                isNameSelectedFromList = true; // סימון שהשם נבחר בצורה חוקית מתוך הרשימה!
            });
            suggestionsContainer.appendChild(div);
        });
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

// סגירת רשימת ההצעות אם לוחצים מחוץ לכרטיסייה
document.addEventListener('click', (e) => {
    if (e.target !== studentNameInput) {
        suggestionsContainer.style.display = 'none';
    }
});

backToSchoolBtn.addEventListener('click', () => {
    nameScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

// כפתור המשך ממסך הקלדת שם - עם בדיקת חובת בחירה קשיחה
submitNameBtn.addEventListener('click', () => {
    const currentInputValue = studentNameInput.value.trim();
    
    if (currentInputValue === "") {
        alert("אנא הקלד/י ובחר/י את שמך מתוך הרשימה");
        return;
    }
    
    // בדיקה כפולה: האם לחץ על הרשימה והאם השם הנוכחי תואם במדויק לשם ברשימה
    if (!isNameSelectedFromList || !allStudentsInSchool.includes(currentInputValue)) {
        alert("חובה לבחור את השם המלא שלך מתוך רשימת השמות המוקפצת!");
        return;
    }

    // אם עבר את הבדיקות - שומרים וממשיכים
    studentName = currentInputValue;
    alert(`שם מאומת בהצלחה!\nמגדר: ${selectedGender === 'Male' ? 'בן' : 'בת'}\nבית ספר: ${selectedSchool}\nשם: ${studentName}`);
    
    // כאן נפתח את מסך הבחירה/הצבעה של המיזמים בשלב הבא
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
