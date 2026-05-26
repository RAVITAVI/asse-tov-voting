const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');
const schoolTitle = document.getElementById('school-title');

let userGender = "";

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

document.getElementById('boyBtn').addEventListener('click', () => {
    userGender = "male";
    schoolTitle.innerText = "מאיזה בית ספר אתה?";
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    userGender = "female";
    schoolTitle.innerText = "מאיזה בית ספר את?";
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
