const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');

// ודאי שהקישור שלך מודבק כאן במלואו בין הגרשיים ושהוא מסתיים ב- /exec
const GOOGLE_SHEET_URL = "הדביקי_כאן_את_הקישור_שלך";

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

function loadSchools(gender) {
    console.log("מנסה לטעון בתי ספר עבור:", gender);
    
    fetch(GOOGLE_SHEET_URL)
        .then(response => response.json())
        .then(data => {
            console.log("נתונים שנתקבלו מהגיליון:", data);
            
            // הסינון כולל ניקוי רווחים (trim) לביטחון
            const filteredSchools = data.filter(item => {
                if (!item.gender) return false;
                return item.gender.toString().trim() === gender;
            });
            
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            
            if (filteredSchools.length === 0) {
                console.warn("לא נמצאו בתי ספר מתאימים למגדר:", gender);
            }

            filteredSchools.forEach(school => {
                const option = document.createElement("option");
                option.value = school.schoolName;
                option.innerText = school.schoolName;
                schoolDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('שגיאה במשיכת הנתונים:', error);
            alert("שגיאה בחיבור לבסיס הנתונים. ודאי שההרשאות בפריסה מוגדרות ל-'Anyone'.");
        });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadSchools("בן");
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadSchools("בת");
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
