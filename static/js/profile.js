// Account information display

// retrieve data on load
const informationForm = document.getElementById("display-information");
const informationMessage = document.getElementById("information-warning");
let userData = {};

// Fetch user data from backend
async function loadUserData() {
    try {
        const response = await fetch("/user", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            informationMessage.style.display = "flex";
            informationMessage.textContent = "Fehler beim Laden der Benutzerdaten";
            return;
        }

        const data = await response.json();
        userData = data;

        // Fill form fields
        document.getElementById("first-name").value = data["first-name"];
        document.getElementById("last-name").value = data["last-name"];
        document.getElementById("age").value = data.age;
        document.getElementById("gender").value = data.gender;
        document.getElementById("username").value = data.username;
    } catch (_) {
        informationMessage.style.display = "flex";
        informationMessage.textContent = "Fehler beim Laden der Benutzerdaten. Bitte melde dich erneut an.";
    }
}

// Call account information retrieval on page load
window.addEventListener("DOMContentLoaded", loadUserData);

// Handle account information form submission
informationForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const currentData = {
        firstName: document.getElementById("first-name").value.trim(),
        lastName: document.getElementById("last-name").value.trim(),
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        username: document.getElementById("username").value.trim(),
    };

    // Check if data has changed
    const changed = (
        currentData.firstName !== userData["first-name"] ||
        currentData.lastName !== userData["last-name"] ||
        currentData.age !== userData.age ||
        currentData.gender !== userData.gender ||
        currentData.username !== userData.username
    );

    if (!changed) {
        informationMessage.textContent = "Keine Änderungen vorgenommen.";
        informationMessage.style.display = "flex";
        return;
    }

    informationMessage.style.display = "none";

    try {
        const response = await fetch("/user", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(currentData)
        });

        // For server-side errors
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    informationMessage.textContent = "Der Nutzername ist bereits vergeben";
                    break;
                default:
                    console.log(error);
                    informationMessage.textContent = "Fehler beim Verarbeiten der Angaben";
            }
            informationMessage.style.display = "flex";
            return;
        }

        const updatedData = await response.json();
        userData = updatedData;

    } catch (_) {
        informationMessage.textContent = "Fehler beim Verarbeiten der Angaben. Bitte versuche es später.";
        informationMessage.style.display = "flex";
    }
});


// Password reset

// Check password match
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const passwordMessage = document.getElementById("password-warning");
const passwordForm = document.getElementById("reset-password");

function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    passwordMessage.textContent = "Die Passwörter stimmen nicht überein";

    if (!password && confirm) {
        passwordMessage.style.display = "flex";
        return false;
    }

    if (password && confirm && password !== confirm) {
        passwordMessage.style.display = "flex";
        return false;
    }

    if (password && confirm && password === confirm) {
        passwordMessage.style.display = "none";
        return true;
    }

    passwordMessage.style.display = "none";
    return false;
}

// Check password match on inputs
passwordInput.addEventListener("input", checkPasswordsMatch);
confirmInput.addEventListener("input", checkPasswordsMatch);

passwordForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Check if passwords match
    if (!checkPasswordsMatch()) {
        passwordMessage.textContent = "Die Passwörter stimmen nicht überein";
        passwordMessage.style.display = "flex";
        return;
    }

    // Hide previous errors
    passwordMessage.style.display = "none";

    // Collect form data
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    try {
        // Send password reset request to backend
        const response = await fetch("/user/password-reset", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ new_password: password })
        });

        // For server-side errors
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    passwordMessage.innerText = "Das neue Passwort muss sich vom alten unterscheiden";
                    break;
                default:
                    passwordMessage.innerText = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
            }
            passwordMessage.style.display = "flex";
            return;
        }

        // Redirect to login if password reset has been successful
        const data = await response.json();
        showNotification("Passwort erfolgreich zurückgesetzt");
        setTimeout(() => {
            window.location.href = "/login";
        }, 1000);
    } catch (_) {
        // For unexpected errors
        passwordMessage.style.display = "flex";
        passwordMessage.textContent = "Fehler beim Zurücksetzen des Passworts. Bitte versuche es später erneut.";
    }
});


// Account deletion

// Display deletion banner and overlay, disable scrolling
function checkDeletion() {
    document.documentElement.classList.add("noscroll");
    document.querySelector(".deletion-overlay").style.visibility = "visible";
    document.querySelector(".deletion-banner").style.visibility = "visible";
}

// Delete account when accepted and cancel deletion otherwise
async function accountDeletion(accepted = true) {
    document.documentElement.classList.remove("noscroll");
    document.querySelector(".deletion-overlay").style.visibility = "hidden";
    document.querySelector(".deletion-banner").style.visibility = "hidden";

    if (accepted) {
        try {
            const response = await fetch("/user/delete", {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                return;
            }

            showNotification("Account wurde erfolgreich gelöscht");
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (_) {
            showNotification("Fehler beim Löschen des Accounts. Bitte versuche es später erneut.");
        }
    } else {
        showNotification("Löschen wurde abgebrochen");
    }
}