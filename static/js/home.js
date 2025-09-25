// Slideshow

// Initialize slideshow with first image on index load
let slideIndex = 1;
showSlide(slideIndex);

// Switch to next or previous slide
function switchSlide(n) {
    showSlide(slideIndex += n);
}

// Switch to specified slide via dots
function currentSlide(n) {
    showSlide(slideIndex = n);
}

// Display one slide with the according image
function showSlide(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    // Reset slideIndex if number of slides is exceeded
    if (n > slides.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = slides.length
    }

    // Hide all slides
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Display chosen slide 
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
}


// Newsletter
document.getElementById("newsletter-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const newsletterWarning = document.getElementsByClassName("user-warning")[0];

    // Hide any previous error message
    newsletterWarning.style.display = "none";
    newsletterWarning.innerText = "";

    try {
        const response = await fetch("/newsletter/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ "first-name": firstName, email })
        });
        
        // For server-side errors, show a user-friendly message
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    newsletterWarning.innerText = "Die Email-Adresse abonniert den Newsletter bereits";
                    break;
                default:
                    newsletterWarning.innerText = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
            }
            newsletterWarning.style.display = "flex";
            return;
        }

        // Show notification if successful
        const data = await response.json();
        localStorage.setItem("newsletter_success", "true");
        window.location.href = "/";
    } catch (_) {
        // For unexpected errors, show another user-friendly message
        newsletterWarning.innerText = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
        newsletterWarning.style.display = "flex";
    }
});

// Loads user notification on page reload
window.addEventListener("DOMContentLoaded", () => {
  const success = localStorage.getItem("newsletter_success");

  if (success === "true") {
    showNotification("Newsletter erfolgreich abonniert", 3000);

    localStorage.removeItem("newsletter_success");
  }
});
