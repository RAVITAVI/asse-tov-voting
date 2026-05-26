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

function loadSchools(genderParam) {
    fetch(GOOGLE_SHEET_URL)
        .then(response => response.json())
        .then(data => {
            // סינון לפי המילים המדויקות מהטבלה שלך: "בנים" או "בנות"
            const filteredSchools = data.filter(item => {
                if (!item.gender) return false;
                return item.gender.toString().trim() === genderParam;
            });
            
            schoolDropdown.innerHTML = '<option value="">בחר בית ספר...</option>';
            
            filteredSchools.forEach(school => {
                const option = document.createElement("option");
                option.value = school.schoolName;
                option.innerText = school.schoolName;
                schoolDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('שגיאה בטעינת בתי הספר:', error));
}

document.getElementById('boyBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר אתה לומד?";
    loadSchools("בנים"); // מחפש בטבלה את הערך "בנים"
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    schoolQuestion.innerText = "מאיזה בית ספר את לומדת?";
    loadSchools("בנות"); // מחפש בטבלה את הערך "בנות"
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
