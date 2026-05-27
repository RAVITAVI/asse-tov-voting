// מסכים
const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const nameScreen = document.getElementById('name-screen');
const votingScreen = document.getElementById('voting-screen'); 

// אלמנטים
const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const studentNameInput = document.getElementById('student-name-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const projectsGrid = document.getElementById('projects-grid'); // מיכל רשת הריבועים

// אלמנטים של החלון הקופץ (Modal)
const ratingModal = document.getElementById('rating-modal');
const modalProjectNo = document.getElementById('modal-project-no');
const modalProjectTitle = document.getElementById('modal-project-title');
const modalProjectCourse = document.getElementById('modal-project-course');
const modalProjectCreators = document.getElementById('modal-project-creators');
const ratingSlider = document.getElementById('rating-slider');
const sliderValuePreview = document.getElementById('slider-value-preview');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// כפתורים
const nextBtn = document.getElementById('nextBtn');
const submitNameBtn = document.getElementById('submitNameBtn');
const backToGenderBtn = document.getElementById('backToGenderBtn');
const backToSchoolBtn = document.getElementById('backToSchoolBtn');

// קישור בסיס הנתונים המרכזי המעודכן שלך בגוגל שיטס
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-FSsI60tnB40x1p-9S1qAJLdFW8cdAYoc_NjYdGgANs/edit?gid=0#gid=0";

// משתנים גלובליים לשמירת נתוני התלמיד וההצבעה
let selectedGender = "";
let selectedSchool = "";
let studentName = "";
let allStudentsData = []; 
let allStudentsInSchool = []; 
let isNameSelectedFromList = false; 
let currentActiveProjectCard = null; // ישמור את כרטיסיית הריבוע שנלחצה כרגע

// רשימת בתי הספר המעודכנת והמדויקת שהגדרת
const SCHOOLS_DATA = [
    { schoolName: "סגולה", gender: "Female" },
    { schoolName: "אולפנת אמิต חיפה", gender: "Female" },
    { schoolName: "אולפנית אמิต שחר", gender: "Female" },
    { schoolName: "אולפנית שחם", gender: "Female" },
    { schoolName: "צביה", gender: "Female" },
    { schoolName: "אולפנת חריש", gender: "Female" },
    { schoolName: "לוינסון בנות", gender: "Female" },
    { schoolName: "אולפנית אמונה אלישבע", gender: "Female" },
    { schoolName: "פלך זכרון יעקב", gender: "Female" },
    { schoolName: "ישיבה תנ\"כית זכרון יעקב", gender: "Male" },
    { schoolName: "ישיבה תיכונית קרית אתא", gender: "Male" },
    { schoolName: "יבנה", gender: "Male" },
    { schoolName: "לוינסון בנים", gender: "Male" },
    { schoolName: "נתיבות דרור", gender: "Male" },
    { schoolName: "ישיבת בנ\"ע - חריש", gender: "Male" },
    { schoolName: "ישיבה תיכונית פרדס חנה כרכור", gender: "Male" }
];

// פונקציית עזר חכמה לניקוי אגרסיבי של גרשיים, מירכאות ורווחים כפולים כדי להבטיח התאמה
function cleanStringForComparison(str) {
    if (!str) return "";
    return str
        .replace(/[\"\'\`\״\׳\俘\”\“]/g, '') 
        .replace(/\s+/g, ' ')             
        .trim()                           
        .toLowerCase();
}

// פונקציה חכמה לפירוק שורת CSV בצורה בטוחה שמתחשבת במירכאות ופסיקים פנימיים
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes; 
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map(col => col.replace(/^"|"$/g, '').trim());
}

// פונקציה לשליפת תלמידים לפי בית ספר ומגדר מתוך גיליון "Students"
function fetchStudentsForSchool(schoolName, genderParam) {
    const matches = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches || !matches[1]) return;
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=Students`;

    fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
            const lines = text.split(/\r?\n/);
            allStudentsInSchool = [];
            allStudentsData = [];
            
            const targetGender = genderParam.trim().toLowerCase();
            const cleanTargetSchool = cleanStringForComparison(schoolName);
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const columns = parseCSVLine(lines[i]);
                
                const currentName = columns[1];   
                const currentSchool = columns[2]; 
                const currentGender = columns[4]; 
                const hasVotedStr = columns[5];   
                
                if (currentSchool && currentGender) {
                    const cleanCurrentSchool = cleanStringForComparison(currentSchool);
                    
                    if (cleanCurrentSchool === cleanTargetSchool && currentGender.toLowerCase() === targetGender) {
                        if (currentName) {
                            allStudentsInSchool.push(currentName);
                            allStudentsData.push({
                                name: currentName,
                                hasVoted: (hasVotedStr && hasVotedStr.toUpperCase() === "TRUE")
                            });
                        }
                    }
                }
            }
            console.log("נטענו בהצלחה " + allStudentsInSchool.length + " תלמידים מבית הספר " + schoolName);
        })
        .catch(error => console.error("שגיאה במשיכת רשימת התלמידים:", error));
}

// פונקציה: משיכת מיזמים מגיליון "projects" וציור ריבועים אדומים/ירוקים על המסך באופן אוטומטי
function fetchAndDisplayProjects(genderParam) {
    const matches = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches || !matches[1]) return;
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=projects`;

    fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
            const lines = text.split(/\r?\n/);
            projectsGrid.innerHTML = ""; // איפוס המכל הישן
            
            const targetGender = genderParam.trim().toLowerCase();
            let counter = 0;

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const columns = parseCSVLine(lines[i]);
                
                const projectNo = columns[1];     // עמודה B - project_no
                const projectTitle = columns[2];  // עמודה C - title
                const projectCourse = columns[3]; // עמודה D - Course
                const projectCreators = columns[4]; // עמודה E - name
                const projectGender = columns[5]; // עמודה F - gender
                
                if (projectGender && projectGender.toLowerCase() === targetGender) {
                    counter++;
                    
                    // יצירת ריבוע המיזם (הקארד האדום/ירוק מהשרטוט שלך)
                    const projectCard = document.createElement('div');
                    projectCard.classList.add('project-card-btn', 'status-not-voted'); // כברירת מחדל לא דורג (אדום)
                    
                    // שמירת הנתונים בתוך האלמנט לשימוש בחלון הקופץ
                    projectCard.dataset.no = projectNo || "";
                    projectCard.dataset.title = projectTitle || "";
                    projectCard.dataset.course = projectCourse || "";
                    projectCard.dataset.creators = projectCreators || "";
                    
                    // תוכן פנימי של הריבוע
                    projectCard.innerHTML = `
                        <div class="card-num">${projectNo}</div>
                        <div class="card-title">${projectTitle}</div>
                        <div class="status-indicator"></div>
                    `;
                    
                    // הוספת אירוע לחיצה: פותח חלון קופץ
                    projectCard.addEventListener('click', () => {
                        openRatingModal(projectCard);
                    });
                    
                    projectsGrid.appendChild(projectCard);
                }
            }
            console.log(`נוצרו אוטומטית ${counter} כפתורי מיזמים.`);
        })
        .catch(error => console.error("שגיאה במשיכת רשימת המיזמים:", error));
}

// פונקציה לפתיחת החלון הקופץ והזרקת נתוני המיזם הספציפי אליו
function openRatingModal(cardElement) {
    currentActiveProjectCard = cardElement; // שמירת הריבוע שנלחץ כרגע
    
    // הזרקת המידע מנתוני הריבוע אל תוך החלון הקופץ
    modalProjectNo.innerText = "מיזם מספר " + cardElement.dataset.no;
    modalProjectTitle.innerText = cardElement.dataset.title;
    modalProjectCourse.innerText = cardElement.dataset.course;
    modalProjectCreators.innerText = cardElement.dataset.creators;
    
    // איפוס הסליידר לברירת מחדל (ציון 5)
    ratingSlider.value = 5;
    sliderValuePreview.innerText = 5;
    
    // הצגת החלון הקופץ
    ratingModal.classList.add('active');
}

// עדכון המספר המוצג מעל הסליידר בזמן הגרירה שלו
ratingSlider.addEventListener('input', (e) => {
    sliderValuePreview.innerText = e.target.value;
});

// כפתור ביטול בחלון הקופץ
modalCancelBtn.addEventListener('click', () => {
    ratingModal.classList.remove('active'); // פשוט סוגר את החלון
    currentActiveProjectCard = null;
});

// כפתור שמור בחלון הקופץ (כרגע רק משנה את העיצוב הויזואלי!)
modalSaveBtn.addEventListener('click', () => {
    if (currentActiveProjectCard) {
        // שינוי הסטטוס של הריבוע הראשי מאדום לירוק עם סימן וי!
        currentActiveProjectCard.classList.remove('status-not-voted');
        currentActiveProjectCard.classList.add('status-voted');
    }
    ratingModal.classList.remove('active'); // סגירת החלון
    currentActiveProjectCard = null;
});

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
        
        studentNameInput.value = "";
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = 'none';
        isNameSelectedFromList = false;

        schoolScreen.classList.remove('active');
        nameScreen.classList.add('active');
        studentNameInput.focus();
    }
});

studentNameInput.addEventListener('input', (e) => {
    const userInput = e.target.value.trim();
    suggestionsContainer.innerHTML = '';
    isNameSelectedFromList = false; 
    
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
                isNameSelectedFromList = true; 
            });
            suggestionsContainer.appendChild(div);
        });
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== studentNameInput) {
        suggestionsContainer.style.display = 'none';
    }
});

backToSchoolBtn.addEventListener('click', () => {
    nameScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

submitNameBtn.addEventListener('click', () => {
    const currentInputValue = studentNameInput.value.trim();
    
    if (currentInputValue === "") {
        alert("אנא הקלד/י ובחר/י את שמך מתוך הרשימה");
        return;
    }
    
    if (!isNameSelectedFromList || !allStudentsInSchool.includes(currentInputValue)) {
        alert("חובה לבחור את השם המלא שלך מתוך רשימת השמות המוקפצת!");
        return;
    }

    const currentStudentObj = allStudentsData.find(student => student.name === currentInputValue);

    if (currentStudentObj && currentStudentObj.hasVoted === true) {
        alert("מותר להצביע רק פעם אחת - תודה על השתתפותך");
        return; 
    }

    studentName = currentInputValue;
    
    fetchAndDisplayProjects(selectedGender);
    
    nameScreen.classList.remove('active');
    votingScreen.classList.add('active');
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
