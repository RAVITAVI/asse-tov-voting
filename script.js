const openingScreen = document.getElementById('opening-screen');
const genderScreen = document.getElementById('gender-screen');
const startBtn = document.getElementById('startBtn');
const adminBtn = document.getElementById('adminBtn');

// מעבר בין מסכים
startBtn.addEventListener('click', () => {
    openingScreen.classList.remove('active');
    genderScreen.classList.add('active');
});

// לוגיקת מנהל
adminBtn.addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    } else if (password !== null) {
        alert("סיסמה שגויה");
    }
});
