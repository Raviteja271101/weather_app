const toggleBtn = document.getElementById("theme-toggle");
const root = document.documentElement;

// Function to update button text
function updateButton() {
  if (root.classList.contains("dark")) {
    toggleBtn.innerHTML = `<i class="w-6 h-6" data-lucide="sun"></i>`;
  } else {
    toggleBtn.innerHTML = `<i class="w-6 h-6" data-lucide="moon"></i>`;
  }
  lucide.createIcons();
}

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  root.classList.add("dark");
}

// Set initial button text
updateButton();

// Toggle
toggleBtn.addEventListener("click", () => {
  root.classList.toggle("dark");

  if (root.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }

  // Update button after toggle
  updateButton();
});

const iconMap = {
    "01d": "sun",
    "01n": "moon",
    "02d": "cloud-sun",
    "02n": "cloud-moon",
    "03d": "cloud",
    "03n": "cloud",
    "04d": "cloudy",
    "04n": "cloudy",
    "09d": "cloud-drizzle",
    "09n": "cloud-drizzle",
    "10d": "cloud-rain",
    "10n": "cloud-rain",
    "11d": "cloud-lightning",
    "11n": "cloud-lightning",
    "13d": "snowflake",
    "13n": "snowflake",
    "50d": "cloud-fog",
    "50n": "cloud-fog",
};

const colorMap = {
    "01d": "#fde047",      // sunny - yellow
    "01n": "#bfdbfe",      // moon - light blue
    "02d": "#fde047",      // cloud-sun - yellow
    "02n": "#bfdbfe",      // cloud-moon - light blue
    "03d": "#d1d5db",      // cloud - light gray
    "03n": "#d1d5db",      // cloud - light gray
    "04d": "#9ca3af",      // cloudy - gray
    "04n": "#9ca3af",      // cloudy - gray
    "09d": "#93c5fd",      // drizzle - light blue
    "09n": "#93c5fd",      // drizzle - light blue
    "10d": "#60a5fa",      // rain - blue
    "10n": "#60a5fa",      // rain - blue
    "11d": "#fbbf24",      // lightning - amber
    "11n": "#fbbf24",      // lightning - amber
    "13d": "#e0f2fe",      // snow - cyan
    "13n": "#e0f2fe",      // snow - cyan
    "50d": "#9ca3af",      // fog - gray
    "50n": "#9ca3af",      // fog - gray
};



let check = document.getElementById("check");
let u = "metric";
let unit = "C";
let cityName = "";
const searchBtn = document.getElementById("search");
const cityInput = document.getElementById("city");

// window.onload = async () => {
//     try {

//         const response = await fetch(`https://ipapi.co/json/`);
//         const data = await response.json();
//         if (data.city) {
//             cityName = data.city;
//             console.log(cityName);
//             document.getElementById("location").textContent = cityName.charAt(0).toUpperCase() + cityName.slice(1);
//             updateWeather(cityName);
//             forecast(cityName);
//         }
//     } catch (e) {
//         console.log(e);
//     }
// }

window.onload = async () => {
  try {
    const cachedLocation = localStorage.getItem("userLocation");
    const cachedTime = localStorage.getItem("userLocationTime");
    const now = Date.now();

    // cache valid for 1 hour
    if (
      cachedLocation &&
      cachedTime &&
      now - Number(cachedTime) < 60 * 60 * 1000
    ) {
      cityName = cachedLocation;
      console.log("Using cached location:", cityName);

      document.getElementById("location").textContent =
        cityName.charAt(0).toUpperCase() + cityName.slice(1);

      updateWeather(cityName);
      forecast(cityName);
      return;
    }

    const response = await fetch("https://ipapi.co/json/");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.city) {
      cityName = data.city;
      console.log("Fetched location:", cityName);

      localStorage.setItem("userLocation", cityName);
      localStorage.setItem("userLocationTime", now);

      document.getElementById("location").textContent =
        cityName.charAt(0).toUpperCase() + cityName.slice(1);

      updateWeather(cityName);
      forecast(cityName);
    }
  } catch (e) {
    console.log("Location fetch failed:", e);

    // fallback city
    cityName = "Mumbai";
    document.getElementById("location").textContent = cityName;
    updateWeather(cityName);
    forecast(cityName);
  }
};

async function toggle() {
    if (check.checked == false) {
        console.log(check.checked);
        u = "metric";
        unit = "C"
    } else {
        u = "imperial"
        unit = "F"
        console.log(check.checked)
    }
    if (cityName) {

        await updateWeather();
        await forecast(cityName);
    }
};

async function fetchSearch() {
    const userInput = cityInput.value.trim();

    if (!userInput) {

        // alert("Please enter a city name");
        return;

    }
    cityName = userInput;
    document.getElementById("location").textContent = cityName.charAt(0).toUpperCase() + cityName.slice(1);


    updateWeather();
    forecast(cityName);

}

searchBtn.addEventListener('click', fetchSearch)
cityInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
        fetchSearch();
    }
})

async function updateWeather() {

    try {


        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=230e14b0339fcfbf87bb725eab7cf590&units=${u}`);

        const data = await response.json();

        if (data.cod == "200") {

            const dateStr = new Date(data.dt * 1000);
            const date = dateStr.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            const day = dateStr.toLocaleDateString('en-US', { weekday: 'long' });
            document.getElementById("date").textContent = `${day}, ${date}`;

            console.log(data.main.temp);

            const weatherCode = data.weather[0].icon;
            const iconName = iconMap[weatherCode] || "help-circle";
            const iconColor = colorMap[weatherCode] || "#ffffff";
            const dayNightClass = weatherCode.endsWith("d") ? "weather-day w-20 h-20" : "weather-night w-20 h-20";
            const mainIcon = document.getElementById("main-weather-icon");
            mainIcon.setAttribute("data-lucide", iconName);
            mainIcon.className = dayNightClass;
            mainIcon.style.color = iconColor;

            lucide.createIcons();

            const feels = Math.floor(data.main.feels_like);
            const desc = data.weather[0].description;
            const humid = data.main.humidity;
            const wind = data.wind.speed;
            const visibility = (data.visibility / 1000).toFixed(1);
            const pressure = data.main.pressure;

            // const windUnit = u === "metric" ? "m/s" : "mph";
            // const visibilityUnit = u === "metric" ? "m" : "mi"; 
            // if (u === "imperial") visibility = (data.visibility / 1609).toFixed(1);

            let windUnit;
            if (u === "metric") {
                windUnit = (wind * 3.6).toFixed(1)
            } else {
                windUnit = (wind * 1.609).toFixed(1)
            }
            document.getElementById("feels").textContent = `Feels like ${feels}°${unit}`;
            document.getElementById("desc").textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
            document.getElementById("humid").textContent = humid;
            document.getElementById("wind").textContent = ` ${windUnit} km/h`;
            document.getElementById("visibility").textContent = `${visibility} km`;
            document.getElementById("pressure").textContent = `${pressure} mb `;

            document.getElementById("degree").textContent = Math.ceil(data.main.temp) + `°${unit}`;

        } else {
            alert("City not found !!!")
            console.log("City not found !!!")
        }
    } catch (err) {
        alert(err.message)
    }
}

async function forecast(cityName) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=230e14b0339fcfbf87bb725eab7cf590&units=${u}`);

    const data = await response.json();

    if (data.cod == "200") {
        const cont = document.getElementById("forecast-container");
        cont.innerHTML = "";

        // const dailyData = data.list.filter(x => x.dt_txt.includes("12:00:00"));
        const dailyData = data.list.filter((_, index) => index % 8 === 0);
        console.log(dailyData);
        let dirty = "";
        dailyData.forEach(y => {
            const dateStr = new Date(y.dt * 1000).toDateString();
            const date = dateStr.split(' ')[1] + ' ' + dateStr.split(' ')[2];
            const day = dateStr.split(' ')[0];
            const temp = y.main.temp;

            // const icon = y.weather[0].icon;
            const weatherCode = y.weather[0].icon; // e.g., "01d"
            const iconName = iconMap[weatherCode] || "help-circle";
            const iconColor = colorMap[weatherCode] || "#ffffff";
            const dayNightClass = weatherCode.endsWith("d") ? "weather-day w-15 h-15 " : "weather-night w-15 h-15 ";


            const tempMax = Math.ceil(y.main.temp_max);
            const tempMin = Math.floor(y.main.temp_min);

            const desc = y.weather[0].description.charAt(0).toUpperCase() + y.weather[0].description.slice(1);

            console.log(tempMax, tempMin)
            console.log(date + " " + temp);
            dirty += `<div class="flex items-center justify-center md:max-w-[200px] max-w-40 shrink w-full border p-4 border-[#ffffff33] bg-[#ffffff1a] backdrop-blur-sm rounded-lg dark:border-[#9333ea4d] dark:bg-[#1e143280]"> 
      <div class= "flex flex-col items-center">
      <h4 class="text-2xl">${day}</h4>
      <h6 class="text-base ">${date}</h6>
      <i data-lucide="${iconName}" class="mb-2 ${dayNightClass}" style="color: ${iconColor}"></i>
      <h6 class="text-base text-center">${desc}</h6>

 <p>${tempMax}° <span class="text-[#cbcccc]">${tempMin}°</span></p>
      </div>
      
     
    </div>`;

        });
        cont.innerHTML = dirty;
        lucide.createIcons();
    }
}



