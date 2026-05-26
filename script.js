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

// רשימת בתי הספר המובנית בקוד
const SCHOOLS_DATA = [
    { schoolName: "סגולה", gender: "Female" },
    { schoolName: "אולפנת אמิต חיפה", gender: "Female" },
    { schoolName: "אולפנת אמิต שחר", gender: "Female" },
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
    
    // משיכת גיליון Students כפורמט CSV ישיר שעוקף חסימות ארגוניות
    const csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=Students`;

    fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
            const lines = text.split('\n');
            allStudentsInSchool = [];
            
            // תרגום מגדר אנגלי למגדר שנבחר בקוד
            const targetGender = genderParam === "Male" ? "male" : "female";
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const columns = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
                
                const currentName = columns[1];   // עמודה B - שם מלא
                const currentSchool = columns[2]; // עמודה C - שם בית ספר
                const currentGender = columns[4]; // עמודה E - מגדר (Male / Female)
                
                // סינון והכנסה למערך ההצעות המקומי רק של התלמידים הרלוונטיים
                if (currentSchool === schoolName && currentGender && currentGender.toLowerCase() === targetGender) {
                    if (currentName) allStudentsInSchool.push(currentName);
                }
            }
            console.log("נטענו בהצלחה " + allStudentsInSchool.length + " תלמידים מבית הספר " + schoolName);
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

// לוגיקת כפתור המשך של מסך בית הספר
nextBtn.addEventListener('click', () => {
    if (schoolDropdown.value === "") {
        alert("אנא בחר בית ספר לפני ההמשך");
    } else {
        selectedSchool = schoolDropdown.value; 
        
        // טעינת רשימת השמות של בית הספר והמגדר שנבחרו
        fetchStudentsForSchool(selectedSchool, selectedGender);
        
        // איפוס שדה הקלט ומסך ההצעות הישן לביטחון
        studentNameInput.value = "";
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = 'none';

        // מעבר למסך הבא
        schoolScreen.classList.remove('active');
        nameScreen.classList.add('active');
        studentNameInput.focus();
    }
});

// לוגיקת השלמה אוטומטית (Autocomplete) במסך השם
studentNameInput.addEventListener('input', (e) => {
    const userInput = e.target.value.trim();
    suggestionsContainer.innerHTML = '';
    
    // מציג הצעות רק החל משני תווים שהוקלדו
    if (userInput.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    // סינון שמות שמכילים את מה שהתלמיד הקליד
    const filteredNames = allStudentsInSchool.filter(name => name.includes(userInput));

    if (filteredNames.length > 0) {
        suggestionsContainer.style.display = 'block';
        filteredNames.forEach(name => {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');
            div.innerText = name;
            
            // בחירה מתוך רשימת ההצעות
            div.addEventListener('click', () => {
                studentNameInput.value = name;
                suggestionsContainer.style.display = 'none';
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
        alert(`נתונים זמניים שנשמרו:\nמגדר: ${selectedGender === 'Male' ? 'בן' : 'בת'}\nבית ספר: ${selectedSchool}\nשם: ${studentName}`);
    }
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
