// js/auth.js

function handleCredentialResponse(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem("userName", payload.given_name);
    localStorage.setItem("userPic", payload.picture);
    window.location.href = "https://kellynepdf.com/index.html";
}

function handleLogout() {
    localStorage.clear();
    window.location.href = "https://kellynepdf.com/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("userName") || "Guest";
    const pic = localStorage.getItem("userPic");
    const h = new Date().getHours();

    let wish = "Good Morning";
    if (h >= 5 && h < 12) wish = "Good Morning";
    else if (h >= 12 && h < 17) wish = "Good Afternoon";
    else if (h >= 17 && h < 21) wish = "Good Evening";
    else wish = "Good Night";

    if (user !== "Guest") {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        document.getElementById('display-name').innerText = user;
        if (pic) document.getElementById('user-avatar').src = pic;
    }

    document.getElementById('greeting').innerText = `${wish}, ${user}!`;
});
