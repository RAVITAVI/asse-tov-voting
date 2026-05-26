document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('opening-screen').classList.remove('active');
    document.getElementById('gender-screen').classList.add('active');
});

document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
    }
});
