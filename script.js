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
const projectsGrid = document.getElementById('projects-grid'); 

// כפתורים
const nextBtn = document.getElementById('nextBtn');
const submitNameBtn = document.getElementById('submitNameBtn');
const backToGenderBtn = document.getElementById('backToGenderBtn');
const backToSchoolBtn = document.getElementById('backToSchoolBtn');
const backToNameBtn = document.getElementById('backToNameBtn'); 

// קישור בסיס הנתונים המרכזי המעודכן שלך בגוגל שיטס
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-FSsI60tnB40x1p-9S1qAJLdFW8cdAYoc_NjYdGgANs/edit?gid=0#gid=0";

// משתנים גלובליים לשמירת נתוני התלמיד והדירוגים שלו
let selectedGender = "";
let selectedSchool = "";
let studentName = "";
let allStudentsData = []; 
let allStudentsInSchool = []; 
let isNameSelectedFromList = false; 
let currentStudentVotingRow = {}; // אובייקט שישמור את דירוגי ה-PROJ של התלמיד הנוכחי שהתחבר

// רשימת בתי הספר המעודכנת והנעולה - נקייה מגרשיים פנימיים למניעת שיבושים
const SCHOOLS_DATA = [
    { schoolName: "סגולה", gender: "Female" },
    { schoolName: "אולפנת אמית חיפה", gender: "Female" },
    { schoolName: "אולפנית אמית שחר", gender: "Female" },
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
                
                const currentName = columns[1];   // עמודה B - FullName
                const currentSchool = columns[2]; // עמודה C - School
                const currentGender = columns[4]; // עמודה E - Gender
                const hasVotedStr = columns[5];   // עמודה F - has_voted
                
                if (currentSchool && currentGender) {
                    const cleanCurrentSchool = cleanStringForComparison(currentSchool);
                    
                    if (cleanCurrentSchool === cleanTargetSchool && currentGender.toLowerCase() === targetGender) {
                        if (currentName) {
                            allStudentsInSchool.push(currentName);
                            
                            // שמירת אובייקט מורחב הכולל את מערך ציוני ה-PROJ1 עד PROJ15 (עמודות G עד U, אינדקסים 6 עד 20)
                            const projScores = {};
                            for (let p = 1; p <= 15; p++) {
                                const columnIndex = 5 + p; // עמודה G היא אינדקס 6 (5+1), עמודה H היא 7 וכו'
                                const scoreValue = columns[columnIndex] ? parseInt(columns[columnIndex]) || 0 : 0;
                                projScores[p] = scoreValue;
                            }

                            allStudentsData.push({
                                name: currentName,
                                hasVoted: (hasVotedStr && hasVotedStr.toUpperCase() === "TRUE"),
                                scores: projScores // שומר את מפת הדירוגים הנוכחית שלו
                            });
                        }
                    }
                }
            }
            console.log("נטענו בהצלחה " + allStudentsInSchool.length + " תלמידים.");
        })
        .catch(error => console.error("שגיאה במשיכת רשימת התלמידים:", error));
}

// פונקציה: משיכת מיזמים מגיליון "projects" וציור כפתורים מרובעים אדומים/ירוקים לפי הנתונים בזמן אמת
function fetchAndDisplayProjects(genderParam) {
    const matches = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches || !matches[1]) return;
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=projects`;

    fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
            const lines = text.split(/\r?\n/);
            projectsGrid.innerHTML = ""; 
            
            const targetGender = genderParam.trim().toLowerCase();
            let counter = 0;

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const columns = parseCSVLine(lines[i]);
                
                const projectNo = parseInt(columns[1]); // עמודה B - project_no (הופך למספר שלם, למשל 1, 2, 5, 10)
                const projectTitle = columns[2];        // עמודה C - title
                const projectGender = columns[5];       // עמודה F - gender
                
                if (projectGender && projectGender.toLowerCase() === targetGender) {
                    counter++;
                    
                    const projectButton = document.createElement('div');
                    
                    // בדיקה חכמה דינמית: מה הציון שקיים אצל התלמיד הנוכחי בעמודת ה-PROJ התואמת למספר המיזם הזה?
                    const currentScore = currentStudentVotingRow[projectNo] || 0;
                    
                    // אם הציון גדול מ-0 הוא מוצג כירוק (דורג), אם הוא 0 הוא מוצג כאדום (לדירוג)
                    if (currentScore > 0) {
                        projectButton.classList.add('project-grid-button', 'color-green');
                        projectButton.innerHTML = `
                            <div class="proj-number">${projectNo}</div>
                            <div class="proj-title">${projectTitle}</div>
                            <div class="proj-status-label">✓ דורג</div>
                        `;
                    } else {
                        projectButton.classList.add('project-grid-button', 'color-red');
                        projectButton.innerHTML = `
                            <div class="proj-number">${projectNo}</div>
                            <div class="proj-title">${projectTitle}</div>
                            <div class="proj-status-label">לדירוג</div>
                        `;
                    }
                    
                    // לוגיקת לחיצה לבדיקה ויזואלית על המסך (מחליפה מצבים בלחיצה)
                    projectButton.addEventListener('click', () => {
                        if (projectButton.classList.contains('color-red')) {
                            projectButton.classList.remove('color-red');
                            projectButton.classList.add('color-green');
                            projectButton.querySelector('.proj-status-label').innerText = "✓ דורג";
                        } else {
                            projectButton.classList.remove('color-green');
                            projectButton.classList.add('color-red');
                            projectButton.querySelector('.proj-status-label').innerText = "לדירוג";
                        }
                    });
                    
                    projectsGrid.appendChild(projectButton);
                }
            }
            console.log(`נוצרו אוטומטית ${counter} כפתורי מיזמים בהתאם למצב הנתונים של התלמיד.`);
        })
        .catch(error => console.error("שגיאה במשיכת רשימת המיזמים:", error));
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
    
    // שמירת מפת הציונים הנוכחית של התלמיד הספציפי שהתחבר לתוך המשתנה הגלובלי
    if (currentStudentObj && currentStudentObj.scores) {
        currentStudentVotingRow = currentStudentObj.scores;
    } else {
        currentStudentVotingRow = {}; // גיבוי למקרה חירום
    }
    
    // הפעלת פונקציית הטעינה שמסננת ומחשבת צבעים לפי הציונים שלו
    fetchAndDisplayProjects(selectedGender);
    
    nameScreen.classList.remove('active');
    votingScreen.classList.add('active');
});

backToNameBtn.addEventListener('click', () => {
    votingScreen.classList.remove('active');
    nameScreen.classList.add('active');
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
