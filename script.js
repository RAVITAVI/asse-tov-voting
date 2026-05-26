const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');

// הדביקי כאן את הקישור הרגיל של ה-Google Sheet שלך מהדפדפן (זה שכולל את ה- /edit)
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-FSsI60tnB40x1p-9S1qAJLdFW8cdAYoc_NjYdGgANs/edit?gid=1774263604#gid=1774263604";

// פונקציה שמייצרת קישור ישיר לגיליון Schools בפורמט CSV, ללא חסימות
function getSchoolsCsvUrl(url) {
    const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
        // כאן אנחנו אומרים לו במפורש לקחת את גיליון Schools (באמצעות sheet=Schools)
        return `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=Schools`;
    }
    return url;
}

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

function loadSchools(genderParam) {
    const finalUrl = getSchoolsCsvUrl(GOOGLE_SHEET_URL);
    
    fetch(finalUrl)
        .then(response => {
            if (!response.ok) throw new Error('שגיאה בתקשורת עם הגיליון');
            return response.text();
        })
        .then(text => {
            const lines = text.split('\n');
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            
            // מעבר על השורות (מדלגים על שורה 0 שהיא כותרות)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                // פירוק לפי פסיקים וניקוי גרשיים שגוגל מוסיף
                const columns = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
                
                const schoolName = columns[1]; // עמודה B - שם בית הספר
                const gender = columns[2];     // עמודה C - המגדר (Male / Female)
                
                // סינון לפי המגדר בטבלה שלך (Male/Female)
                if (gender && gender.toLowerCase() === genderParam.toLowerCase()) {
                    const option = document.createElement("option");
                    option.value = schoolName;
                    option.innerText = schoolName;
                    schoolDropdown.appendChild(option);
                }
            }
        })
        .catch(error => {
            console.error('שגיאה בטעינת הנתונים:', error);
            alert("שגיאה בטעינת בתי הספר. ודאי שהגיליון מוגדר ל-'כל מי שקיבל את הקישור יכול לצפות'.");
        });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadSchools("Male"); // מסנן לפי Male בטבלה שלך
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadSchools("Female"); // מסנן לפי Female בטבלה שלך
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
