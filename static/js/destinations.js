// API credentials 
// In a productive system, one would not insert these API credentials directly in the code.
// For simplicity reasons, they are stated below.

const geoNamesUsername = "ksuhiyp";
const pexelsApiKey = "4YekTxKSBicoukI4HOB65AjcsUoiy7Km5NMKBrELsVjEJGDfiomkdXpI";

// Leaflet map initialization
const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);
const markers = L.layerGroup().addTo(map);

// Highlight section

const highlightCities = [
  { name: "Tokyo", countryCode: "JP" },
  { name: "Mexico City", countryCode: "MX" },
  { name: "New York", countryCode: "US" },
  { name: "Cairo", countryCode: "EG" },
  { name: "Sydney", countryCode: "AU" },
  { name: "Moscow", countryCode: "RU" },
  { name: "Cape Town", countryCode: "ZA" },
  { name: "São Paulo", countryCode: "BR" },
  { name: "Berlin", countryCode: "DE" },
  { name: "Dubai", countryCode: "AE" }
];

// Global State
let favorites = [];
let isLoggedIn = false;

async function checkAuthStatus() {
  try {
    const resp = await fetch("user/is-authenticated");
    const data = await resp.json();
    isLoggedIn = data.is_authenticated === true;
  } catch (err) {
    console.error("Error checking authentication:", err);
    isLoggedIn = false;
  }
}

async function loadFavoritesFromBackend() {
  try {
    const resp = await fetch("/favorites");
    const data = await resp.json();
    
    favorites = (data.favorites || []).map(({ class_id, ...rest }) => ({
      ...rest,
      class: class_id
    }));
  } catch (err) {
    console.error("Error fetching favorites:", err);
    favorites = [];
  }
}

function extractCityClassFromCard(cardEl) {
  for (const cls of cardEl.classList) {
    if (cls.startsWith("city-") && cls !== "city-card") {
      return cls;
    }
  }
  return null;
}

// Toggle star UI in all matching cards
function toggleStarUI(cityClass, isActive) {
  const starEls = document.querySelectorAll(`.city-card.${cityClass} .favorite .star`);
  starEls.forEach(star => star.classList.toggle("active", isActive));
}

// Update the “no favorites” text & section
function updateFavoritesTextUI() {
  const favoritesSection = document.querySelector(".favorites-section");
  const favoritesAlert = document.getElementById("favorites-alert");
  const container = document.querySelector(".favorite-cards-container");

  if (favorites.length === 0) {
    favoritesAlert.style.display = "block";
    favoritesSection.classList.add("no-gradient");
    container.style.display = "none";
  } else {
    favoritesAlert.style.display = "none";
    favoritesSection.classList.remove("no-gradient");
    container.style.display = "flex";
  }
}

// Add a favorite city card to the UI
function uiAddFavoriteCard(cityData) {
  const favContainer = document.querySelector(".favorite-cards-container");
  if (!favContainer.querySelector(`.city-card.${cityData.class}`)) {
    const favCard = document.createElement("div");
    favCard.classList.add("city-card", cityData.class);
    favCard.innerHTML = createCityCardHTML(
      cityData.name,
      cityData.flag,
      cityData.imageUrl,
      cityData.population,
      cityData.country,
      true
    );
    favContainer.appendChild(favCard);
  }
}

// Remove a favorite city card in the favorites UI
function uiRemoveFavoriteCard(cityClass) {
  const favContainer = document.querySelector(".favorite-cards-container");
  const cardEl = favContainer.querySelector(`.city-card.${cityClass}`);
  if (cardEl) {
    favContainer.removeChild(cardEl);
  }
}

// Favorite / Toggle Logic

async function saveFavoriteToBackend(cityData) {
  try {
    await fetch("/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites })
    });
  } catch (err) {
    console.error("Error saving favorite:", err);
  }
}

async function deleteFavoriteFromBackend(cityClass) {
  try {
    await fetch(`/favorites/${encodeURIComponent(cityClass)}`, {
      method: "DELETE"
    });
  } catch (err) {
    console.error("Error deleting favorite:", err);
  }
}

async function toggleFavorite(starElement) {
  if (!isLoggedIn) {
    alert("Bitte logge dich ein, um Favoriten zu speichern.");
    return;
  }
  const card = starElement.closest(".city-card");
  const cityClass = extractCityClassFromCard(card);
  if (!cityClass) {
    console.error("Could not determine cityClass for card", card);
    return;
  }

  // Check if already favorite
  const idx = favorites.findIndex(fav => fav.class === cityClass);
  const isFav = idx !== -1;

  if (isFav) {
    favorites.splice(idx, 1);

    uiRemoveFavoriteCard(cityClass);
    toggleStarUI(cityClass, false);

    await deleteFavoriteFromBackend(cityClass);
  } else {
    const cityData = {
      class: cityClass,
      name: card.querySelector("h1")?.innerText || "",
      population: card.querySelector(".population")?.innerText.replace("Einwohner: ", "") || "",
      country: card.querySelector(".country")?.innerText.replace("Land: ", "") || "",
      flag: card.querySelector(".flag")?.src || "",
      imageUrl: card.querySelector(".card-image")?.src || ""
    };
    favorites.push(cityData);

    uiAddFavoriteCard(cityData);
    toggleStarUI(cityClass, true);

    await saveFavoriteToBackend(cityData);
  }

  updateFavoritesTextUI();
}

// Create city card HTML

function createCityCardHTML(cityName, cityFlagSrc, imageUrl, cityPopulation, cityCountry, isFavorite) {
  return `
    <div class="flag-container">
      <img src="${cityFlagSrc}" alt="Flag of ${cityCountry}" class="flag">
    </div>
    ${isLoggedIn ? `
    <div class="favorite" onclick="toggleFavorite(this)">
      <svg class="star ${isFavorite ? "active" : ""}" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24
                 l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73
                 L5.82 21z" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </div>` : ""}
    <img src="${imageUrl}" alt="City ${cityName}, ${cityCountry}" class="card-image">
    <h1>${cityName}</h1>
    <p class="population">Einwohner: ${cityPopulation.toLocaleString("de-DE")}</p>
    <p class="country">Land: ${cityCountry}</p>
  `;
}


// Display Highlight Cities

async function displayHighlightCities() {
  const container = document.querySelector(".highlight-cards-container");
  container.innerHTML = "";

  for (const h of highlightCities) {
    const url = `http://api.geonames.org/searchJSON?username=${geoNamesUsername}&country=${h.countryCode}&q=${h.name}&featureClass=P&maxRows=1`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      const city = data.geonames[0];
      if (!city) continue;

      const cityName = city.name;
      const cityPopulation = city.population;
      const cityCountry = city.countryName;
      const cityFlag = `https://flagcdn.com/w320/${h.countryCode.toLowerCase()}.png`;

      const imageUrl = await fetchCityImage(cityName);

      const card = document.createElement("div");
      card.classList.add("city-card");
      const cityClass = generateCityClass(cityName, cityCountry);
      card.classList.add(cityClass);

      card.innerHTML = createCityCardHTML(cityName, cityFlag, imageUrl, cityPopulation, cityCountry, false);

      if (favorites.some(fav => fav.class === cityClass)) {
        card.querySelector(".favorite .star")?.classList.add("active");
      }

      container.appendChild(card);
    } catch (err) {
      console.error("Error fetching highlight city", h, err);
    }
  }
}

// Country / City Search Logic

const selectElement = document.getElementById("countries");
const UserWarning = document.getElementById("user-warning");
let highlightedButton = null;
let selectedCountries = [];
let selectedCities = [];

function toggleContinent(button, continent) {
  if (highlightedButton === button) return;

  if (highlightedButton) {
    highlightedButton.classList.remove("highlighted");
    const prevClose = highlightedButton.nextElementSibling;
    if (prevClose) prevClose.style.display = "none";
  }

  button.classList.add("highlighted");
  const closeBtn = button.nextElementSibling;
  if (closeBtn) closeBtn.style.display = "inline";

  highlightedButton = button;
  UserWarning.style.display = "none";
  selectElement.innerHTML = "";

  fetchCountries(continent);
  markers.clearLayers();
  map.setView([20, 0], 2);
}

function removeContinent(closeButton) {
  const button = closeButton.previousElementSibling;
  button.classList.remove("highlighted");
  closeButton.style.display = "none";

  highlightedButton = null;
  selectElement.innerHTML = "";
  selectElement.append(new Option("Bitte wähle dein Land"));
  
  markers.clearLayers();
  map.setView([20, 0], 2);
}

async function fetchCountries(continent) {
  selectedCountries = [];
  selectElement.innerHTML = "";

  const resp = await fetch(`https://restcountries.com/v3.1/region/${continent}`);
  const countries = await resp.json();

  selectElement.append(new Option("Alle", "Alle"));
  countries.forEach(c => {
    selectElement.append(new Option(c.name.common, c.name.common));
  });
  sortSelectOptions();

  const randomCountries = countries.sort(() => 0.5 - Math.random()).slice(0, 10);
  randomCountries.forEach(c => {
    selectedCountries.push([c.name.common, c.cca2, c.continents[0], c.flags.png]);
  });

  selectElement.addEventListener("change", () => {
    selectedCountries = [];
    const sel = selectElement.value;
    if (sel !== "Alle") {
      const c = countries.find(x => x.name.common === sel);
      if (c) {
        selectedCountries.push([c.name.common, c.cca2, c.continents[0], c.flags.png]);
        setMarker(c.name.common, c.latlng);
      }
    } else {
      const randomCountries2 = countries.sort(() => 0.5 - Math.random()).slice(0, 10);
      randomCountries2.forEach(c => {
        selectedCountries.push([c.name.common, c.cca2, c.continents[0], c.flags.png]);
      });
      markers.clearLayers();
      map.setView([20, 0], 2);
    }
  });
}

function sortSelectOptions() {
  const opts = Array.from(selectElement.options);
  opts.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
  selectElement.innerHTML = "";
  opts.forEach(o => selectElement.appendChild(o));
}

async function setMarker(countryName, latlng) {
  markers.clearLayers();
  map.setView(latlng, 5);
  L.marker(latlng).addTo(markers).bindPopup(`<b>${countryName}</b>`).openPopup();
}

function submitChoice() {
  if (!highlightedButton) {
    UserWarning.style.display = "block";
  } else {
    fetchCities();
    document.querySelector(".city-cards-container").style.display = "flex";
    const titleEl = document.querySelector(".city-cards-title");
    let title = selectedCountries.length === 1 ? selectedCountries[0][0] : selectedCountries[0][2];
    if (title.includes("America")) title = "America";
    titleEl.innerHTML = `Reiseziele in ${title}`;
  }
}

async function fetchCities() {
  selectedCities = [];

  if (selectedCountries.length === 1) {
    const [ , countryId, , flagUrl ] = selectedCountries[0];
    const url = `http://api.geonames.org/searchJSON?username=${geoNamesUsername}&country=${countryId}&featureClass=P&maxRows=10`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      data.geonames.forEach(city => {
        selectedCities.push([city.name, city.population, ...selectedCountries[0]]);
      });
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  } else {
    for (const countryData of selectedCountries) {
      const countryId = countryData[1];
      const url = `http://api.geonames.org/searchJSON?username=${geoNamesUsername}&country=${countryId}&featureClass=P&maxRows=1`;
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        const city = data.geonames[0];
        if (city) {
          selectedCities.push([city.name, city.population, ...countryData]);
        }
      } catch (err) {
        console.error("Error fetching one city per country:", err);
      }
    }
  }

  displayCities();
}

async function displayCities() {
  const container = document.querySelector(".city-cards-container");
  container.innerHTML = "";

  for (const c of selectedCities) {
    const [ cityName, cityPopulation, countryName, countryCode, continent, flagUrl ] = c;
    const imageUrl = await fetchCityImage(cityName);

    const card = document.createElement("div");
    card.classList.add("city-card");
    const cityClass = generateCityClass(cityName, countryName);
    card.classList.add(cityClass);

    card.innerHTML = createCityCardHTML(cityName, flagUrl, imageUrl, cityPopulation, countryName, false);

    if (favorites.some(fav => fav.class === cityClass)) {
      card.querySelector(".favorite .star")?.classList.add("active");
    }

    container.appendChild(card);
  }
}

// Helper / Utilities

function generateCityClass(cityName, countryName) {
  const clean = str =>
    str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/g, "")
       .replace(/\s+/g, "-")
       .toLowerCase();
  return `city-${clean(cityName)}-${clean(countryName)}`;
}

async function fetchCityImage(cityName) {
  const url = `https://api.pexels.com/v1/search?query=${cityName}&per_page=1&topic=city&orientation=landscape`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: pexelsApiKey }
    });
    const data = await resp.json();
    if (!data.photos || data.photos.length === 0) {
      return "/static/img/destinations/img_destinations.jpg";
    }
    return data.photos[0].src.medium;
  } catch (err) {
    console.error("Error fetching city image:", err);
    return "/static/img/destinations/img_destinations.jpg";
  }
}

// Initialization on load

window.addEventListener("load", async () => {
  await checkAuthStatus();

  if (isLoggedIn) {
    await loadFavoritesFromBackend();
    favorites.forEach(city => uiAddFavoriteCard(city));
    updateFavoritesTextUI();
  }

  await displayHighlightCities();
});

