// Essential functionalities for all pages


// Cookie Banner

// Display notifications for a given duration (in milliseconds)
function showNotification(message, duration = 2000) {
    const notification = document.querySelector(".notification");
    notification.textContent = message;
    notification.style.display = "block";
    
    // Make notification disappear after duration is exceeded
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
            notification.style.opacity = "1";
        }, 500);
    }, duration);
}

function checkCookies() {
    const cookiesAccepted = localStorage.getItem("cookiesSet");

    // Check if cookies have already been accepted
    if (!cookiesAccepted) {
        // Display cookie banner and overlay, disable scrolling
        document.documentElement.classList.add("noscroll");
        document.querySelector(".cookie-overlay").style.visibility = "visible";
        document.querySelector(".cookie-banner").style.visibility = "visible";
    }
}

function setCookies(accepted=true) {
    // Store that cookies have been set
    localStorage.setItem("cookiesSet", true);

    // Remove cookie banner and overlay from screen, enable scrolling
    document.documentElement.classList.remove("noscroll");
    document.querySelector(".cookie-overlay").style.visibility = "hidden";
    document.querySelector(".cookie-banner").style.visibility = "hidden";

    // Check whether cookies have been accepted and display notification accordingly
    if (accepted) {
        showNotification("Drittanbieter-Cookies wurden akzeptiert.");
    }
    else {
        showNotification("Drittanbieter-Cookies wurden abgelehnt.");
    }
}

// Run checkCookies on every page load except for the data protection page
window.onload = function () {
    const currentPath = window.location.pathname;

    // Run checkCookies only when not on the data protection page
    if (!currentPath.includes("data_protection.html")) {
        checkCookies();
    }
};


// Navigation bar

// Display/hide vertical navigation bar if burger menu is clicked
function showBurgerMenu() {
    const burgerNav = document.querySelector(".nav-burger-links");
    if (burgerNav.style.display === "none" || burgerNav.style.display === "") {
        burgerNav.style.display = "flex";
    } else {
        burgerNav.style.display = "none";
        
        // Hide profile menu instantly when in burger menu
        const profileMenu = document.querySelector(".nav-profile-links");
        profileMenu.classList.remove("nav-burger-profile-links");
        profileMenu.style.display = "none";
    }
  }

// Check screen size and display burger menu if screen width is too small
window.addEventListener("resize", function() {
    const nav = document.querySelector(".nav-links");
    const burgerNav = document.querySelector(".nav-burger-links");
    const profileMenu = document.querySelector(".nav-profile-links");
    if (window.innerWidth > 900) {
        if (nav) nav.style.display = "block";
        if (burgerNav) burgerNav.style.display = "none";
    } else {
        if (nav && nav.style.display !== "none") nav.style.display = "none";
        if (profileMenu) profileMenu.style.display = "none";
    }
});

// Display/hide vertical profile bar if profile icon is hovered (n = 2 indicates that the burger menu is open)
let hideMenuTimeout;

function showProfileMenu(n) {
    const profileMenu = document.querySelector(".nav-profile-links");

    // Clear pending hide timeout
    clearTimeout(hideMenuTimeout);
    if (n == 2) {
        profileMenu.classList.add("nav-burger-profile-links");
    }
    profileMenu.style.display = "flex";
}

function hideProfileMenu(n) {
    const profileMenu = document.querySelector(".nav-profile-links");

    // Delay hiding by 300ms
    hideMenuTimeout = setTimeout(() => {
        if (n == 2) {
            profileMenu.classList.remove("nav-burger-profile-links");
        }
        profileMenu.style.display = "none";
    }, 300);
}


// Footer

// Automatic scrolling to target section "imprint" on the imprint page
document.addEventListener("DOMContentLoaded", function() {
    // Scan URL properties for "section" attribute
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get("section");
    
    // Check if target section exists on the page and scroll down smoothly if so
    if (section) {
        const targetElement = document.getElementById(section);
        if (targetElement) {
            // Add offset to make sure the section is not covered by the header
            const offset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({top: offsetPosition, behavior: "smooth"});

            history.replaceState(null, null, window.location.pathname);
        }
    }
});

// Dynamic copyright year update in footer
const currentYear = new Date().getFullYear();
document.querySelector(".current-year").textContent = currentYear;