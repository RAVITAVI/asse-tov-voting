const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');

// עדכני כאן את הקישור שקיבלת מהפריסה ב-Apps Script:
const GOOGLE_SHEET_URL = "הדביקי_כאן_את_הקישור_שלך";

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

// פונקציה חדשה שטוענת את כל בתי הספר ללא סינון בכלל
function loadAllSchools() {
    fetch(GOOGLE_SHEET_URL)
        .then(response => response.json())
        .then(data => {
            // איפוס שדה הגלילה והוספת אפשרות ברירת המחדל
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            
            // מעבר על כל בתי הספר שהגיעו מהגיליון והוספתם לשדה הגלילה
            data.forEach(school => {
                if (school.schoolName) { // בדיקה ששם בית הספר לא ריק
                    const option = document.createElement("option");
                    option.value = school.schoolName;
                    option.innerText = school.schoolName;
                    schoolDropdown.appendChild(option);
                }
            });
        })
        .catch(error => {
            console.error('שגיאה במשיכת בתי הספר:', error);
            alert("שגיאה בקבלת הנתונים מגוגל שיטס. ודאי שהקישור תקין.");
        });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadAllSchools(); // טעינת הרשימה המלאה
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadAllSchools(); // טעינת הרשימה המלאה
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
