// ניהול כפתור מנהל
document.getElementById('adminBtn').addEventListener('click', () => {
    const password = prompt("הכנס סיסמת מנהל:");
    if (password === "02062026") {
        alert("ברוך הבא למערכת הניהול");
        // כאן תהיה הפנייה לדף הניהול בעתיד
    } else if (password !== null) {
        alert("סיסמה שגויה");
    }
});

// ניהול כפתור מתחילים
document.getElementById('startBtn').addEventListener('click', () => {
    console.log("עוברים למסך בחירת מגדר");
    // כאן תהיה הפנייה למסך הבא
});
