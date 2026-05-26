const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const schoolScreen = document.getElementById('school-screen');

let userGender = ""; // כאן יישמר הקוד (male/female)

document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

document.getElementById('boyBtn').addEventListener('click', () => {
    userGender = "male";
    console.log("המגדר שנבחר:", userGender); // לבדיקה
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('girlBtn').addEventListener('click', () => {
    userGender = "female";
    console.log("המגדר שנבחר:", userGender); // לבדיקה
    genderScreen.classList.remove('active');
    schoolScreen.classList.add('active');
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
