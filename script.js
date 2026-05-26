const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');

// מעבר בין מסכים
document.getElementById('startBtn').addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

// לוגיקת מנהל
document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
