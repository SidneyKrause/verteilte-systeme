// Password comparison
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const registerMessage = document.getElementById("register-warning");
const passwordForm = document.getElementsByClassName("login-form")[0];

function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    registerMessage.textContent = "Die Passwörter stimmen nicht überein";

    if (!password && confirm) {
        registerMessage.style.display = "flex";
        return false;
    }

    if (password && confirm && password !== confirm) {
        registerMessage.style.display = "flex";
        return false;
    }

    if (password && confirm && password === confirm) {
        registerMessage.style.display = "none";
        return true;
    }

    registerMessage.style.display = "none";
    return false;
}

// Check password match on inputs
passwordInput.addEventListener("input", checkPasswordsMatch);
confirmInput.addEventListener("input", checkPasswordsMatch);

// Check password match on submit
passwordForm.addEventListener("submit", function (e) {
    if (!checkPasswordsMatch()) {
        e.preventDefault();
        registerMessage.textContent = "Die Passwörter stimmen nicht überein";
        registerMessage.style.display = "flex";
    }
});


// Register logic
document.getElementsByClassName("login-form")[0].addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const registerMessage = document.getElementById("register-warning");

    // Hide any previous error message
    registerMessage.style.display = "none";
    registerMessage.textContent = "";

    try {
        const response = await fetch("/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                "first-name": firstName,
                "last-name": lastName,
                age,
                gender,
                username,
                password
            })
        });

        // For server-side errors
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    registerMessage.textContent = "Der Nutzername existiert bereits";
                    break;
                default:
                    registerMessage.textContent = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
            }
            registerMessage.style.display = "flex";
            return;
        }

        // Redirect to homepage if login has been successful
        const data = await response.json();
        window.location.href = "/";
    } catch (_) {
        // For unexpected errors, show another user-friendly message
        registerMessage.textContent = "Die Angaben sind fehlerhaft";
        registerMessage.style.display = "flex";
    }
});