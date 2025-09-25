document.getElementsByClassName("login-form")[0].addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("login-warning");

    // Hide any previous error message
    errorMessage.style.display = "none";
    errorMessage.innerText = "";

    try {
        const response = await fetch("/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });
        
        // For server-side errors, show a user-friendly message
        if (!response.ok) {
            switch (response.status) {
                case 401:
                    errorMessage.innerText = "Passwort fehlerhaft";
                    break;
                case 404:
                    errorMessage.innerText = "Der Nutzername existiert nicht";
                    break;
                default:
                    errorMessage.innerText = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
            }
            errorMessage.style.display = "flex";
            return;
        }

        // Redirect to homepage if login has been successful
        const data = await response.json();
        window.location.href = "/";
    } catch (_) {
        // For unexpected errors, show another user-friendly message
        errorMessage.innerText = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
        errorMessage.style.display = "flex";
    }
});