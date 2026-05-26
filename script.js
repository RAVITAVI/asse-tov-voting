const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const nextBtn = document.getElementById('nextBtn');

// 1. הדביקי כאן את הקישור הרגיל של ה-Google Sheet שלך:
const REGULAR_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-FSsI60tnB40x1p-9S1qAJLdFW8cdAYoc_NjYdGgANs/edit?gid=1774263604#gid=1774263604";

// 2. פונקציה שממירה את הקישור הרגיל לקישור שמוריד את הנתונים ישירות כקובץ CSV
function getCsvUrl(url) {
    const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
        return `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=Schools`;
    }
    return url;
}

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

// פונקציה שטוענת ומסננת את בתי הספר ישירות מהקובץ
function loadSchools(genderParam) {
    const csvUrl = getCsvUrl(REGULAR_SHEET_URL);
    
    fetch(csvUrl)
        .then(response => response.text()) // קורא את הטבלה כטקסט
        .then(text => {
            // הפיכת ה-CSV למערך של שורות
            const lines = text.split('\n');
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            
            // מעבר על השורות (מדלגים על שורה 0 שהיא הכותרות)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                // פירוק השורה לעמודות (מוריד את הגרשיים המיותרים שגוגל מוסיף)
                const columns = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
                
                const schoolName = columns[1]; // עמודה B - שם בית הספר
                const gender = columns[2];     // עמודה C - המגדר (Male / Female)
                
                // ביצוע הסינון לפי המגדר שנבחר
                if (gender && gender.toLowerCase() === genderParam.toLowerCase()) {
                    const option = document.createElement("option");
                    option.value = schoolName;
                    option.innerText = schoolName;
                    schoolDropdown.appendChild(option);
                }
            }
        })
        .catch(error => {
            console.error('שגיאה בקריאת הגיליון:', error);
            alert("שגיאה בתקשורת עם הגיליון. ודאי שהגדרת שיתוף ל-'כל מי שקיבל את הקישור'.");
        });
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadSchools("Male"); // מסנן רק בתי ספר של בנים (Male)
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadSchools("Female"); // מסנן רק בתי ספר של בנות (Female)
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
