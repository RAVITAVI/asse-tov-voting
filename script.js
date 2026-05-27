const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const nameScreen = document.getElementById('name-screen');
const votingScreen = document.getElementById('voting-screen'); 

const schoolQuestion = document.getElementById('school-question');
const schoolDropdown = document.getElementById('school-dropdown');
const studentNameInput = document.getElementById('student-name-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const projectsGrid = document.getElementById('projects-grid'); 

const ratingModal = document.getElementById('rating-modal');
const modalProjectNo = document.getElementById('modal-project-no');
const modalProjectTitle = document.getElementById('modal-project-title');
const modalProjectCourse = document.getElementById('modal-project-course');
const modalProjectCreators = document.getElementById('modal-project-creators');
const ratingSlider = document.getElementById('rating-slider');
const sliderValuePreview = document.getElementById('slider-value-preview');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalCloseX = document.getElementById('modal-close-x');

// רכיבי סורק ברקודים
const scanQrBtn = document.getElementById('scan-qr-btn');
const scannerModal = document.getElementById('scanner-modal');
const scannerCloseX = document.getElementById('scanner-close-x');
let html5QrcodeScanner = null;

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const submitNameBtn = document.getElementById('submitNameBtn');
const backToGenderBtn = document.getElementById('backToGenderBtn');
const backToSchoolBtn = document.getElementById('backToSchoolBtn');
const backToNameBtn = document.getElementById('backToNameBtn'); 

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-FSsI60tnB40x1p-9S1qAJLdFW8cdAYoc_NjYdGgANs/edit?gid=0#gid=0";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyTj6OuSvDvgfru8VN-9SCwxmciiBZ59Y-aCZeWZLzXV1AgZvTwMdKM2jVgnIG3OSI/exec";

let selectedGender = "";
let selectedSchool = "";
let studentName = "";
let allStudentsData = []; 
let allStudentsInSchool = []; 
let isNameSelectedFromList = false; 
let currentStudentVotingRow = {}; 
let currentSelectedProjectNo = null; 
let currentSelectedCardElement = null; 
let rawProjectsData = []; 

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

function cleanStringForComparison(str) {
    if (!str) return "";
    return str.replace(/[\"\'\`\״\׳\俘\”\“]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else { current += char; }
    }
    result.push(current.trim());
    return result.map(col => col.replace(/^"|"$/g, '').trim());
}

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
                            const projScores = {};
                            for (let p = 1; p <= 15; p++) {
                                const columnIndex = 5 + p; 
                                projScores[p] = columns[columnIndex] ? parseInt(columns[columnIndex]) || 0 : 0;
                            }
                            allStudentsData.push({
                                name: currentName,
                                hasVoted: (hasVotedStr && hasVotedStr.toUpperCase() === "TRUE"),
                                scores: projScores
                            });
                        }
                    }
                }
            }
        }).catch(error => console.error(error));
}

function openRatingPanelDirectly(projectNo, projectTitle, projectCreators, projectCourse, currentScore, cardElement) {
    currentSelectedProjectNo = projectNo;
    currentSelectedCardElement = cardElement;
    
    modalProjectNo.innerText = "מיזם מספר " + projectNo;
    modalProjectTitle.innerText = projectTitle;
    modalProjectCreators.innerText = projectCreators || "לא צוין";
    modalProjectCourse.innerText = projectCourse || "לא צוין";
    
    const liveScore = currentStudentVotingRow[projectNo] || 0;
    if (liveScore > 0) {
        ratingSlider.value = liveScore;
        sliderValuePreview.innerText = liveScore;
    } else {
        ratingSlider.value = 0;
        sliderValuePreview.innerText = "לא דורג";
    }
    
    ratingModal.style.display = 'flex';
}

function fetchAndDisplayProjects(genderParam) {
    const matches = GOOGLE_SHEET_URL.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches || !matches[1]) return;
    const csvUrl = `https://docs.google.com/spreadsheets/d/${matches[1]}/gviz/tq?tqx=out:csv&sheet=projects`;

    fetch(csvUrl)
        .then(response => response.text())
        .then(text => {
            const lines = text.split(/\r?\n/);
            projectsGrid.innerHTML = ""; 
            rawProjectsData = []; 
            const targetGender = genderParam.trim().toLowerCase();

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const columns = parseCSVLine(lines[i]);
                
                const projectNo = parseInt(columns[1]);     
                const projectTitle = columns[2];  
                const projectCourse = columns[3];
                const projectCreators = columns[4];
                const projectGender = columns[5]; 
                
                if (projectGender && projectGender.toLowerCase() === targetGender) {
                    const projectButton = document.createElement('div');
                    const currentScore = currentStudentVotingRow[projectNo] || 0;
                    
                    rawProjectsData.push({
                        no: projectNo, title: projectTitle, creators: projectCreators, course: projectCourse, element: projectButton
                    });

                    if (currentScore > 0) {
                        projectButton.className = 'project-grid-button color-green';
                        projectButton.innerHTML = '<div class="proj-number">' + projectNo + '</div><div class="proj-title">' + projectTitle + '</div><div class="proj-status-label">✓ דורג (' + currentScore + ')</div>';
                    } else {
                        projectButton.className = 'project-grid-button color-red';
                        projectButton.innerHTML = '<div class="proj-number">' + projectNo + '</div><div class="proj-title">' + projectTitle + '</div><div class="proj-status-label">לדירוג</div>';
                    }
                    
                    projectButton.onclick = function() {
                        openRatingPanelDirectly(projectNo, projectTitle, projectCreators, projectCourse, currentScore, projectButton);
                    };
                    
                    projectsGrid.appendChild(projectButton);
                }
            }
        }).catch(error => console.error(error));
}

// לוגיקת סורק הברקודים מותאמת המגדר
scanQrBtn.onclick = function() {
    scannerModal.style.display = 'flex';
    
    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    html5QrcodeScanner.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { 
            const rawText = decodedText.trim().toUpperCase();
            
            // בדיקת המגדר של הברקוד לעומת המגדר של התלמיד
            const barcodeGenderPrefix = rawText.charAt(0); // 'G' או 'B'
            const scannedProjNo = parseInt(rawText.replace(/[^\d]/g, '')); // חילוץ מספר המיזם מתוך הברקוד

            if (barcodeGenderPrefix === 'G' && selectedGender !== 'Female') {
                alert("סרקת ברקוד של מסלול בנות, אך הנך רשום במסלול בנים!");
                stopScanner();
                return;
            }
            if (barcodeGenderPrefix === 'B' && selectedGender !== 'Male') {
                alert("סרקת ברקוד של מסלול בנים, אך הנך רשומה במסלול בנות!");
                stopScanner();
                return;
            }

            stopScanner();
            
            const foundProj = rawProjectsData.find(p => p.no === scannedProjNo);
            if (foundProj) {
                openRatingPanelDirectly(foundProj.no, foundProj.title, foundProj.creators, foundProj.course, currentStudentVotingRow[foundProj.no] || 0, foundProj.element);
            } else {
                alert("מיזם מספר " + scannedProjNo + " לא נמצא ברשימה הפעילה שלך.");
            }
        },
        (errorMessage) => { }
    ).catch(err => {
        console.error(err);
        alert("לא ניתן לגשת למצלמה. ודאו שאישרתם הרשאת מצלמה בדפדפן.");
        scannerModal.style.display = 'none';
    });
};

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            scannerModal.style.display = 'none';
        }).catch(err => console.error(err));
    } else {
        scannerModal.style.display = 'none';
    }
}

scannerCloseX.onclick = stopScanner;

ratingSlider.oninput = function(e) {
    const val = parseInt(e.target.value);
    if (val === 0) { sliderValuePreview.innerText = "לא דורג"; } 
    else { sliderValuePreview.innerText = val; }
};

function closeRatingModal() {
    ratingModal.style.display = 'none';
    currentSelectedProjectNo = null;
    currentSelectedCardElement = null;
}
modalCancelBtn.onclick = closeRatingModal;
modalCloseX.onclick = closeRatingModal;

modalSaveBtn.onclick = function() {
    const selectedScore = parseInt(ratingSlider.value);
    if (selectedScore === 0) {
        alert("אנא בחרו ציון בין 1 ל-10 לפני הלחיצה על שמור, או לחצו ביטול.");
        return;
    }
    
    modalSaveBtn.innerText = "שומר...";
    modalSaveBtn.disabled = true;
    
    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            studentName: studentName,
            projNumber: currentSelectedProjectNo,
            score: selectedScore
        })
    })
    .then(() => {
        currentStudentVotingRow[currentSelectedProjectNo] = selectedScore;
        currentSelectedCardElement.className = 'project-grid-button color-green';
        currentSelectedCardElement.querySelector('.proj-status-label').innerText = '✓ דורג (' + selectedScore + ')';
        modalSaveBtn.innerText = "שמור";
        modalSaveBtn.disabled = false;
        closeRatingModal();
    })
    .catch(err => {
        console.error("שגיאה בשמירה:", err);
        alert("תקלה בתקשורת. אנא נסו שנית.");
        modalSaveBtn.innerText = "שמור";
        modalSaveBtn.disabled = false;
    });
};

startBtn.onclick = function() { openingScreen.classList.remove('active'); genderScreen.classList.add('active'); };

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

document.getElementById('boyBtn').onclick = function() { selectedGender = "Male"; schoolQuestion.innerText = "באיזה בית ספר אתה לומד?"; loadSchools("Male"); genderScreen.classList.remove('active'); schoolScreen.classList.add('active'); };
document.getElementById('girlBtn').onclick = function() { selectedGender = "Female"; schoolQuestion.innerText = "באיזה בית ספר את לומדת?"; loadSchools("Female"); genderScreen.classList.remove('active'); schoolScreen.classList.add('active'); };
backToGenderBtn.onclick = function() { schoolScreen.classList.remove('active'); genderScreen.classList.add('active'); };

nextBtn.onclick = function() {
    if (schoolDropdown.value === "") { alert("אנא בחר בית ספר לפני ההמשך"); } 
    else {
        selectedSchool = schoolDropdown.value; 
        fetchStudentsForSchool(selectedSchool, selectedGender);
        studentNameInput.value = ""; suggestionsContainer.innerHTML = ""; suggestionsContainer.style.display = 'none'; isNameSelectedFromList = false;
        schoolScreen.classList.remove('active'); nameScreen.classList.add('active'); studentNameInput.focus();
    }
};

studentNameInput.oninput = function(e) {
    const userInput = e.target.value.trim();
    suggestionsContainer.innerHTML = ''; isNameSelectedFromList = false; 
    if (userInput.length < 2) { suggestionsContainer.style.display = 'none'; return; }
    const filteredNames = allStudentsInSchool.filter(name => name.includes(userInput));
    if (filteredNames.length > 0) {
        suggestionsContainer.style.display = 'block';
        filteredNames.forEach(name => {
            const div = document.createElement('div'); div.className = 'suggestion-item'; div.innerText = name;
            div.onclick = function() { studentNameInput.value = name; suggestionsContainer.style.display = 'none'; isNameSelectedFromList = true; };
            suggestionsContainer.appendChild(div);
        });
    } else { suggestionsContainer.style.display = 'none'; }
};

document.onclick = function(e) { if (e.target !== studentNameInput) { suggestionsContainer.style.display = 'none'; } };
backToSchoolBtn.onclick = function() { nameScreen.classList.remove('active'); schoolScreen.classList.add('active'); };

submitNameBtn.onclick = function() {
    const currentInputValue = studentNameInput.value.trim();
    if (currentInputValue === "") { alert("אנא הקלד/י ובחר/י את שמך מתוך הרשימה"); return; }
    if (!isNameSelectedFromList || !allStudentsInSchool.includes(currentInputValue)) { alert("חובה לבחור את השם המלא שלך מתוך רשימת השמות המוקפצת!"); return; }
    const currentStudentObj = allStudentsData.find(student => student.name === currentInputValue);
    if (currentStudentObj && currentStudentObj.hasVoted === true) { alert("מותר להצביע רק פעם אחת - תודה על השתתפותך"); return; }
    studentName = currentInputValue;
    currentStudentVotingRow = (currentStudentObj && currentStudentObj.scores) ? currentStudentObj.scores : {};
    fetchAndDisplayProjects(selectedGender);
    nameScreen.classList.remove('active'); votingScreen.classList.add('active');
};

backToNameBtn.onclick = function() { votingScreen.classList.remove('active'); nameScreen.classList.add('active'); };
document.getElementById('adminBtn').onclick = function() { const password = prompt("הכנס סיסמת מנהל:"); if (password === "02062026") { alert("ברוך הבא למערכת הניהול"); } };
