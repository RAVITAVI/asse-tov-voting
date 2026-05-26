const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');

// 1. הדביקי כאן את הקישור הרגיל של ה-Google Sheet שלך מהדפדפן:
const REGULAR_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-FSsI60tnB40x1p-9S1qAJLdFW8cdAYoc_NjYdGgANs/edit?gid=1774263604#gid=1774263604";

// 2. פונקציה שמחלצת את מזהה הגיליון ומייצרת קישור עוקף חסימות דפדפן (CORS)
function getCleanDataUrl(url) {
    const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
        // משתמשים בשרת תיווך ציבורי כדי למנוע מהדפדפן לחסום את הבקשה
        return `https://api.allorigins.win/raw?url=https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=Schools`;
    }
    return url;
}

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

function loadSchools(genderParam) {
    const finalUrl = getCleanDataUrl(REGULAR_SHEET_URL);
    
    fetch(finalUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(text => {
            // פירוק הטקסט לשורות
            const lines = text.split('\n');
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            
            let count = 0;

            // מעבר על השורות (מדלגים על שורה 0 שהיא כותרות)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                // פירוק לפי פסיקים וניקוי גרשיים שגוגל מוסיף
                const columns = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
                
                const schoolName = columns[1]; // עמודה B - שם בית הספר
                const gender = columns[2];     // עמודה C - המגדר (Male / Female)
                
                // סינון קפדני לפי המגדר בטבלה שלך
                if (gender && gender.toLowerCase() === genderParam.toLowerCase()) {
                    const option = document.createElement("option");
                    option.value = schoolName;
                    option.innerText = schoolName;
                    schoolDropdown.appendChild(option);
                    count++;
                }
            }
            
            if(count === 0) {
                console.log("לא נמצאו בתי ספר למגדר: " + genderParam);
            }
        })
        .catch(error => {
            console.error('שגיאה חמורה בקריאת הנתונים:', error);
            alert("לא ניתן לטעון את בתי הספר. ודאי שהגיליון פתוח לצפייה לכל מי שיש לו קישור.");
        });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadSchools("Male"); // יחפש בקובץ את המילה Male
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadSchools("Female"); // יחפש בקובץ את המילה Female
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
