/* Atlas — interactive globe, map and live weather */
(function () {
  "use strict";

  const canvas = document.getElementById("globeCanvas");
  const board = document.querySelector(".atlas");
  if (!canvas || !board) return;

  const $ = (selector) => document.querySelector(selector);
  const placeEl = $("#weatherPlace");
  const coordsEl = $("#weatherCoords");
  const timeEl = $("#weatherTime");
  const iconEl = $("#weatherIcon");
  const tempEl = $("#weatherTemp");
  const conditionEl = $("#weatherCondition");
  const feelsEl = $("#weatherFeels");
  const humidityEl = $("#weatherHumidity");
  const windEl = $("#weatherWind");
  const rainEl = $("#weatherRain");
  const zoneEl = $("#weatherZone");
  const forecastEl = $("#forecast");
  const statusEl = $("#weatherStatus");
  const heroTemp = document.getElementById("heroWeatherTemp");
  const heroIcon = document.getElementById("heroWeatherIcon");
  const heroCondition = document.getElementById("heroWeatherCondition");
  const heroPlace = document.getElementById("heroWeatherPlace");
  const heroHumidity = document.getElementById("heroHumidity");
  const heroWind = document.getElementById("heroWind");
  const heroTime = document.getElementById("heroTime");
  const heroForecast = document.getElementById("heroForecast");
  const barIcon = document.getElementById("barWeatherIcon");
  const barTemp = document.getElementById("barWeatherTemp");
  const barPlace = document.getElementById("barWeatherPlace");
  const cityButtons = Array.from(document.querySelectorAll(".globe-cities button"));
  const searchForm = document.getElementById("atlasSearch");
  const searchInput = document.getElementById("atlasQuery");
  const searchResults = document.getElementById("searchResults");
  let searchToken = 0;

  const state = {
    lat: 19.5,
    lon: 110,
    place: "Hainan, China",
    request: 0,
  };

  /* ---------------- weather helpers ---------------- */
  const WMO = {
    0: ["Clear sky", "☀"],
    1: ["Mainly clear", "🌤"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁"],
    45: ["Fog", "🌫"],
    48: ["Rime fog", "🌫"],
    51: ["Light drizzle", "🌦"],
    53: ["Drizzle", "🌦"],
    55: ["Dense drizzle", "🌧"],
    56: ["Freezing drizzle", "🌧"],
    57: ["Freezing drizzle", "🌧"],
    61: ["Light rain", "🌦"],
    63: ["Rain", "🌧"],
    65: ["Heavy rain", "🌧"],
    66: ["Freezing rain", "🌧"],
    67: ["Freezing rain", "🌧"],
    71: ["Light snow", "🌨"],
    73: ["Snow", "🌨"],
    75: ["Heavy snow", "❄"],
    77: ["Snow grains", "🌨"],
    80: ["Light showers", "🌦"],
    81: ["Showers", "🌧"],
    82: ["Heavy showers", "🌧"],
    85: ["Snow showers", "🌨"],
    86: ["Snow showers", "❄"],
    95: ["Thunderstorm", "⛈"],
    96: ["Thunder + hail", "⛈"],
    99: ["Thunder + hail", "⛈"],
  };

  function weather(code) {
    return WMO[code] || ["Weather", "◌"];
  }

  function formatCoords(lat, lon) {
    const ns = lat >= 0 ? "N" : "S";
    const ew = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lon).toFixed(2)}° ${ew}`;
  }

  function setStatus(text, error = false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("error", error);
  }

  function setLoading() {
    if (tempEl) tempEl.textContent = "--°";
    if (conditionEl) conditionEl.textContent = "Reading the sky…";
    if (feelsEl) feelsEl.textContent = "--°";
    if (humidityEl) humidityEl.textContent = "--%";
    if (windEl) windEl.textContent = "-- km/h";
    if (rainEl) rainEl.textContent = "-- mm";
    if (zoneEl) zoneEl.textContent = "—";
    if (timeEl) timeEl.textContent = "--:--";
    if (forecastEl) forecastEl.innerHTML = "";
    if (heroTemp) heroTemp.textContent = "--°";
    if (heroCondition) heroCondition.textContent = "Reading the sky…";
    if (heroHumidity) heroHumidity.textContent = "--%";
    if (heroWind) heroWind.textContent = "-- km/h";
    if (heroTime) heroTime.textContent = "--:--";
    if (heroForecast) heroForecast.innerHTML = "";
    if (barIcon) barIcon.textContent = "◌";
    if (barTemp) barTemp.textContent = "--°";
    setStatus("Connecting to open weather…");
  }

  function paintWeather(data, place) {
    const current = data.current;
    const units = data.current_units || {};
    const [label, icon] = weather(current.weather_code);
    const temp = Math.round(current.temperature_2m);
    const feels = Math.round(current.apparent_temperature);
    const displayIcon = current.is_day ? icon : icon === "☀" ? "☾" : icon;
    const shortPlace = String(place).split(",")[0];
    const localTime = (current.time || "").slice(11, 16) || "--:--";

    const group =
      current.weather_code <= 1
        ? "clear"
        : current.weather_code <= 3
        ? "cloud"
        : current.weather_code === 45 || current.weather_code === 48
        ? "fog"
        : current.weather_code >= 51 && current.weather_code < 70
        ? "rain"
        : current.weather_code >= 71 && current.weather_code < 80
        ? "snow"
        : current.weather_code >= 80 && current.weather_code < 90
        ? "rain"
        : current.weather_code >= 95
        ? "storm"
        : "cloud";

    document.body.dataset.weather = group;
    document.body.dataset.day = current.is_day ? "1" : "0";

    if (placeEl) placeEl.textContent = place;
    if (heroPlace) heroPlace.textContent = place;
    if (heroTemp) heroTemp.textContent = `${temp}°`;
    if (heroCondition) heroCondition.textContent = label;
    if (heroIcon) heroIcon.textContent = displayIcon;
    if (heroHumidity) heroHumidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    if (heroWind) heroWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    if (heroTime) heroTime.textContent = localTime;
    if (barIcon) barIcon.textContent = displayIcon;
    if (barTemp) barTemp.textContent = `${temp}°`;
    if (barPlace) barPlace.textContent = shortPlace;
    if (coordsEl) coordsEl.textContent = formatCoords(data.latitude, data.longitude);
    if (tempEl) tempEl.textContent = `${temp}°`;
    if (conditionEl) conditionEl.textContent = `${label} · ${current.is_day ? "day" : "night"}`;
    if (iconEl) iconEl.textContent = current.is_day ? icon : icon === "☀" ? "☾" : icon;
    if (feelsEl) feelsEl.textContent = `${feels}°`;
    if (humidityEl) humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}${units.relative_humidity_2m || "%"}`;
    if (windEl) windEl.textContent = `${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m || "km/h"}`;
    if (rainEl) rainEl.textContent = `${Number(current.precipitation || 0).toFixed(1)} ${units.precipitation || "mm"}`;
    if (zoneEl) zoneEl.textContent = data.timezone_abbreviation || data.timezone || "local";
    if (timeEl) timeEl.textContent = (current.time || "").slice(11, 16) || "--:--";

    const daily = data.daily || {};
    const days = (daily.time || []).slice(0, 5);

    if (forecastEl) {
      forecastEl.innerHTML = "";
      days.forEach((date, index) => {
        const [, dIcon] = weather(daily.weather_code[index]);
        const dateObj = new Date(date + "T12:00:00");
        const day = dateObj.toLocaleDateString("en", { weekday: "short" });
        const max = Math.round(daily.temperature_2m_max[index]);
        const min = Math.round(daily.temperature_2m_min[index]);
        const item = document.createElement("div");
        item.innerHTML = `<span>${day}</span><i>${dIcon}</i><strong>${max}° / ${min}°</strong>`;
        forecastEl.appendChild(item);
      });
    }

    if (heroForecast) {
      heroForecast.innerHTML = "";
      days.slice(0, 3).forEach((date, index) => {
        const [, dIcon] = weather(daily.weather_code[index]);
        const dateObj = new Date(date + "T12:00:00");
        const day = dateObj.toLocaleDateString("en", { weekday: "short" });
        const max = Math.round(daily.temperature_2m_max[index]);
        const min = Math.round(daily.temperature_2m_min[index]);
        const item = document.createElement("div");
        item.innerHTML = `<span>${day}</span><i>${dIcon}</i><strong>${max}° / ${min}°</strong>`;
        heroForecast.appendChild(item);
      });
    }

    const detail = {
      place,
      temp,
      feels,
      humidity: Math.round(current.relative_humidity_2m),
      wind: Math.round(current.wind_speed_10m),
      rain: Number(current.precipitation || 0),
      code: current.weather_code,
      isDay: Boolean(current.is_day),
      label,
      icon: displayIcon,
      time: localTime,
    };
    window.__lastWeather = detail;
    document.dispatchEvent(new CustomEvent("weather:update", { detail }));

    setStatus(`Live · Open-Meteo · updated ${(current.time || "").slice(11, 16)} local`);
  }

  async function loadWeather(lat, lon, place) {
    const id = ++state.request;
    setLoading();
    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      encodeURIComponent(lat) +
      "&longitude=" +
      encodeURIComponent(lon) +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=auto&forecast_days=5";

    let data = null;
    let geo = null;

    const weatherController = new AbortController();
    const weatherTimeout = setTimeout(() => weatherController.abort(), 12000);

    try {
      const response = await fetch(weatherUrl, {
        cache: "no-store",
        signal: weatherController.signal,
      });
      if (!response.ok) throw new Error("weather request failed");
      data = await response.json();
    } catch {
      if (id === state.request) {
        setStatus("Weather is unavailable right now. The map still works.", true);
        if (conditionEl) conditionEl.textContent = "No signal";
      }
      return;
    } finally {
      clearTimeout(weatherTimeout);
    }

    const geoController = new AbortController();
    const geoTimeout = setTimeout(() => geoController.abort(), 6000);

    try {
      const geoResponse = await fetch(
        "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
          encodeURIComponent(lat) +
          "&longitude=" +
          encodeURIComponent(lon) +
          "&localityLanguage=en",
        { cache: "no-store", signal: geoController.signal }
      );
      if (geoResponse.ok) geo = await geoResponse.json();
    } catch {
      geo = null;
    } finally {
      clearTimeout(geoTimeout);
    }

    if (id !== state.request) return;

    if (geo) {
      const city = geo.city || geo.locality || geo.principalSubdivision;
      const country = geo.countryName;
      if (city) place = city + (country && city !== country ? `, ${country}` : "");
    }
    state.place = place;
    paintWeather(data, place);
  }

  // Open-Meteo's Chinese index is great for places in China but can miss
  // well-known world cities (东京 -> a small town in Jiangsu). These aliases
  // keep the common bilingual searches accurate.
  const CITY_ALIASES = [
    ["Beijing", "北京", "China", "中国", 39.9042, 116.4074],
    ["Shanghai", "上海", "China", "中国", 31.2304, 121.4737],
    ["Guangzhou", "广州", "China", "中国", 23.1291, 113.2644],
    ["Shenzhen", "深圳", "China", "中国", 22.5431, 114.0579],
    ["Hangzhou", "杭州", "China", "中国", 30.2741, 120.1551],
    ["Nanjing", "南京", "China", "中国", 32.0603, 118.7969],
    ["Chengdu", "成都", "China", "中国", 30.5728, 104.0668],
    ["Chongqing", "重庆", "China", "中国", 29.563, 106.5516],
    ["Wuhan", "武汉", "China", "中国", 30.5928, 114.3055],
    ["Xi'an", "西安", "China", "中国", 34.3416, 108.9398],
    ["Hong Kong", "香港", "China", "中国", 22.3193, 114.1694],
    ["Taipei", "台北", "Taiwan", "台湾", 25.033, 121.5654],
    ["Tokyo", "东京", "Japan", "日本", 35.6762, 139.6503],
    ["Osaka", "大阪", "Japan", "日本", 34.6937, 135.5023],
    ["Kyoto", "京都", "Japan", "日本", 35.0116, 135.7681],
    ["Seoul", "首尔", "South Korea", "韩国", 37.5665, 126.978],
    ["Singapore", "新加坡", "Singapore", "新加坡", 1.3521, 103.8198],
    ["Bangkok", "曼谷", "Thailand", "泰国", 13.7563, 100.5018],
    ["Kuala Lumpur", "吉隆坡", "Malaysia", "马来西亚", 3.139, 101.6869],
    ["Jakarta", "雅加达", "Indonesia", "印度尼西亚", -6.2088, 106.8456],
    ["Manila", "马尼拉", "Philippines", "菲律宾", 14.5995, 120.9842],
    ["Hanoi", "河内", "Vietnam", "越南", 21.0278, 105.8342],
    ["Sydney", "悉尼", "Australia", "澳大利亚", -33.8688, 151.2093],
    ["Melbourne", "墨尔本", "Australia", "澳大利亚", -37.8136, 144.9631],
    ["Auckland", "奥克兰", "New Zealand", "新西兰", -36.8509, 174.7645],
    ["London", "伦敦", "United Kingdom", "英国", 51.5072, -0.1276],
    ["Paris", "巴黎", "France", "法国", 48.8566, 2.3522],
    ["Berlin", "柏林", "Germany", "德国", 52.52, 13.405],
    ["Rome", "罗马", "Italy", "意大利", 41.9028, 12.4964],
    ["Madrid", "马德里", "Spain", "西班牙", 40.4168, -3.7038],
    ["Amsterdam", "阿姆斯特丹", "Netherlands", "荷兰", 52.3676, 4.9041],
    ["Vienna", "维也纳", "Austria", "奥地利", 48.2082, 16.3738],
    ["Zurich", "苏黎世", "Switzerland", "瑞士", 47.3769, 8.5417],
    ["Stockholm", "斯德哥尔摩", "Sweden", "瑞典", 59.3293, 18.0686],
    ["Copenhagen", "哥本哈根", "Denmark", "丹麦", 55.6761, 12.5683],
    ["Moscow", "莫斯科", "Russia", "俄罗斯", 55.7558, 37.6173],
    ["Istanbul", "伊斯坦布尔", "Turkey", "土耳其", 41.0082, 28.9784],
    ["Dubai", "迪拜", "UAE", "阿联酋", 25.2048, 55.2708],
    ["Cairo", "开罗", "Egypt", "埃及", 30.0444, 31.2357],
    ["Cape Town", "开普敦", "South Africa", "南非", -33.9249, 18.4241],
    ["New York", "纽约", "USA", "美国", 40.7128, -74.006],
    ["Los Angeles", "洛杉矶", "USA", "美国", 34.0522, -118.2437],
    ["San Francisco", "旧金山", "USA", "美国", 37.7749, -122.4194],
    ["Chicago", "芝加哥", "USA", "美国", 41.8781, -87.6298],
    ["Seattle", "西雅图", "USA", "美国", 47.6062, -122.3321],
    ["Toronto", "多伦多", "Canada", "加拿大", 43.6532, -79.3832],
    ["Vancouver", "温哥华", "Canada", "加拿大", 49.2827, -123.1207],
    ["Mexico City", "墨西哥城", "Mexico", "墨西哥", 19.4326, -99.1332],
    ["Sao Paulo", "圣保罗", "Brazil", "巴西", -23.5505, -46.6333],
    ["Rio de Janeiro", "里约热内卢", "Brazil", "巴西", -22.9068, -43.1729],
    ["Buenos Aires", "布宜诺斯艾利斯", "Argentina", "阿根廷", -34.6037, -58.3816],
    ["Lima", "利马", "Peru", "秘鲁", -12.0464, -77.0428],
  ].map(([en, zh, countryEn, countryZh, lat, lon]) => ({
    en,
    zh,
    countryEn,
    countryZh,
    lat,
    lon,
    aliases: [en.toLowerCase(), zh, en.replace(/\s+/g, "").toLowerCase()],
  }));

  function localMatches(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CITY_ALIASES.filter((city) =>
      city.aliases.some((alias) => alias === q || alias.startsWith(q))
    ).slice(0, 5);
  }

  function closeSearch() {
    if (searchResults) searchResults.hidden = true;
  }

  function showSearchResults(items) {
    if (!searchResults) return;
    searchResults.innerHTML = "";
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-result";
      button.setAttribute("role", "option");

      const copy = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = item.name;
      const detail = document.createElement("small");
      detail.textContent = [item.admin1, item.country].filter(Boolean).join(" · ") || "Location";
      copy.append(name, detail);

      const coords = document.createElement("em");
      coords.textContent = `${Number(item.latitude).toFixed(1)}°, ${Number(item.longitude).toFixed(1)}°`;
      button.append(copy, coords);

      button.addEventListener("click", () => {
        if (searchInput) searchInput.value = item.name;
        closeSearch();
        selectLocation(item.latitude, item.longitude, item.place || item.name, true);
      });
      searchResults.appendChild(button);
    });
    searchResults.hidden = false;
  }

  function searchEmpty(message) {
    if (!searchResults) return;
    searchResults.innerHTML = "";
    const item = document.createElement("div");
    item.className = "search-empty";
    item.textContent = message;
    searchResults.appendChild(item);
    searchResults.hidden = false;
  }

  async function searchPlaces(query) {
    const q = String(query || "").trim();
    if (!q) {
      searchEmpty("Type a city in English or 中文.");
      searchInput?.focus();
      return;
    }

    const hasChinese = /[\u3400-\u9fff]/.test(q);
    const local = localMatches(q);
    if (local.length) {
      showSearchResults(
        local.map((city) => ({
          name: hasChinese ? city.zh : city.en,
          admin1: `${city.zh} · ${city.en}`,
          country: hasChinese ? city.countryZh : city.countryEn,
          latitude: city.lat,
          longitude: city.lon,
          place: `${hasChinese ? city.zh : city.en}, ${hasChinese ? city.countryZh : city.countryEn}`,
        }))
      );
      return;
    }

    const token = ++searchToken;
    searchEmpty("Searching…");
    const language = hasChinese ? "zh" : "en";
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(q) +
      "&count=6&language=" +
      language +
      "&format=json";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("search failed");
      const data = await response.json();
      if (token !== searchToken) return;
      const results = Array.isArray(data.results) ? data.results : [];
      if (!results.length) {
        searchEmpty(`No place found for “${q}”. Try 北京 or Beijing.`);
        return;
      }

      showSearchResults(
        results.map((result) => ({
          name: result.name,
          admin1: result.admin1,
          country: result.country,
          latitude: result.latitude,
          longitude: result.longitude,
          place: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
        }))
      );
    } catch (error) {
      if (token !== searchToken) return;
      searchEmpty(
        error.name === "AbortError"
          ? "Search timed out. Check the connection and try again."
          : "Search is unavailable right now. Try again in a moment."
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    searchPlaces(searchInput?.value);
  });

  document.addEventListener("click", (event) => {
    if (!searchForm?.contains(event.target)) closeSearch();
  });

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSearch();
  });

  function selectLocation(lat, lon, place, focus = true) {
    closeSearch();
    lat = Math.max(-85, Math.min(85, Number(lat)));
    lon = Math.max(-180, Math.min(180, Number(lon)));
    state.lat = lat;
    state.lon = lon;
    state.place = place || "Dropped pin";
    if (placeEl) placeEl.textContent = state.place;
    if (heroPlace) heroPlace.textContent = state.place;
    if (coordsEl) coordsEl.textContent = formatCoords(lat, lon);
    if (focus) globeApi.focus(lat, lon);
    if (mapApi) mapApi.update(lat, lon);
    cityButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        Math.abs(Number(button.dataset.lat) - lat) < 0.2 && Math.abs(Number(button.dataset.lon) - lon) < 0.2
      );
    });
    loadWeather(lat, lon, state.place);
  }

  /* ---------------- globe ---------------- */
  const SIZE = 640;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 282;
  const ctx = canvas.getContext("2d", { alpha: true });
  const imageData = ctx.createImageData(SIZE, SIZE);
  const earth = new Image();
  let texture = null;
  let texW = 1024;
  let texH = 512;

  let yaw = (-110 * Math.PI) / 180;
  let pitch = (19.5 * Math.PI) / 180;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let moved = 0;
  let targetYaw = null;
  let targetPitch = null;
  let auto = true;
  let visible = true;
  let lastFrame = 0;

  const cities = [
    ["Hainan", 19.5, 110],
    ["Beijing", 39.9, 116.4],
    ["Tokyo", 35.68, 139.69],
    ["London", 51.51, -0.13],
    ["New York", 40.71, -74.01],
    ["Sydney", -33.87, 151.21],
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function project(lat, lon) {
    const phi = (lat * Math.PI) / 180;
    const lambda = (lon * Math.PI) / 180;
    const x = Math.cos(phi) * Math.sin(lambda);
    const y = Math.sin(phi);
    const z = Math.cos(phi) * Math.cos(lambda);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    return { x: CX + x1 * RADIUS, y: CY - y2 * RADIUS, z: z2 };
  }

  function unproject(screenX, screenY) {
    const vx = (screenX - CX) / RADIUS;
    const vy = (CY - screenY) / RADIUS;
    const r2 = vx * vx + vy * vy;
    if (r2 > 1) return null;
    const vz = Math.sqrt(1 - r2);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);

    const y1 = vy * cp + vz * sp;
    const z1 = -vy * sp + vz * cp;
    const x2 = vx * cy - z1 * sy;
    const z2 = vx * sy + z1 * cy;

    return {
      lat: (Math.asin(clamp(y1, -1, 1)) * 180) / Math.PI,
      lon: (Math.atan2(x2, z2) * 180) / Math.PI,
    };
  }

  function drawGlobe() {
    const data = imageData.data;
    data.fill(0);
    if (!texture) {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = "rgba(8, 24, 28, 0.9)";
      ctx.beginPath();
      ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const light = [-0.5, 0.28, 0.82];
    const lightLength = Math.hypot(light[0], light[1], light[2]);
    light[0] /= lightLength;
    light[1] /= lightLength;
    light[2] /= lightLength;

    for (let y = 0; y < SIZE; y++) {
      const vy = (CY - y) / RADIUS;
      for (let x = 0; x < SIZE; x++) {
        const vx = (x - CX) / RADIUS;
        const r2 = vx * vx + vy * vy;
        if (r2 > 1) continue;
        const vz = Math.sqrt(1 - r2);

        // inverse rotation: view -> world
        const y1 = vy * cp + vz * sp;
        const z1 = -vy * sp + vz * cp;
        const x2 = vx * cy - z1 * sy;
        const z2 = vx * sy + z1 * cy;
        const lat = Math.asin(clamp(y1, -1, 1));
        const lon = Math.atan2(x2, z2);

        let tx = Math.floor(((lon + Math.PI) / (Math.PI * 2)) * texW);
        let ty = Math.floor(((Math.PI / 2 - lat) / Math.PI) * texH);
        tx = ((tx % texW) + texW) % texW;
        ty = clamp(ty, 0, texH - 1);
        const ti = (ty * texW + tx) * 4;

        const dot = vx * light[0] + vy * light[1] + vz * light[2];
        const lit = 0.42 + 0.64 * Math.max(0, dot);
        const rim = Math.pow(1 - vz, 2) * 0.22;
        const i = (y * SIZE + x) * 4;

        data[i] = clamp(texture.data[ti] * lit + 7 + rim * 28, 0, 255);
        data[i + 1] = clamp(texture.data[ti + 1] * lit + 11 + rim * 35, 0, 255);
        data[i + 2] = clamp(texture.data[ti + 2] * lit + 14 + rim * 42, 0, 255);
        data[i + 3] = 255;
      }
    }

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.putImageData(imageData, 0, 0);

    // graticule
    ctx.save();
    ctx.strokeStyle = "rgba(110, 232, 218, 0.13)";
    ctx.lineWidth = 0.8;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let started = false;
      for (let lon = -180; lon <= 180; lon += 4) {
        const p = project(lat, lon);
        if (p.z <= 0) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let lon = -150; lon <= 180; lon += 30) {
      ctx.beginPath();
      let started = false;
      for (let lat = -90; lat <= 90; lat += 3) {
        const p = project(lat, lon);
        if (p.z <= 0) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // city dots
    cities.forEach(([, lat, lon]) => {
      const p = project(lat, lon);
      if (p.z <= 0) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(216, 255, 119, 0.72)";
      ctx.fill();
    });

    // selected point
    const selected = project(state.lat, state.lon);
    if (selected.z > 0) {
      const pulse = 5 + Math.sin(performance.now() / 420) * 1.8;
      ctx.beginPath();
      ctx.arc(selected.x, selected.y, pulse + 5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(89, 227, 211, 0.88)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(selected.x, selected.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#d8ff77";
      ctx.fill();
    }
  }

  function frame(now) {
    if (!visible || document.hidden) {
      lastFrame = now;
      requestAnimationFrame(frame);
      return;
    }
    if (now - lastFrame < 32) {
      requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;

    if (targetYaw !== null) {
      let delta = ((targetYaw - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      yaw += delta * 0.12;
      pitch += (targetPitch - pitch) * 0.12;
      if (Math.abs(delta) < 0.002 && Math.abs(targetPitch - pitch) < 0.002) {
        targetYaw = null;
        targetPitch = null;
      }
    } else if (auto && !dragging) {
      yaw += 0.00038;
    }

    drawGlobe();
    requestAnimationFrame(frame);
  }

  function focus(lat, lon) {
    targetYaw = (-lon * Math.PI) / 180;
    targetPitch = (Math.max(-75, Math.min(75, lat)) * Math.PI) / 180;
  }

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((clientX - rect.left) / rect.width) * SIZE;
    const y = ((clientY - rect.top) / rect.height) * SIZE;
    return unproject(x, y);
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    moved = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    auto = false;
    targetYaw = null;
    targetPitch = null;
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    yaw += dx * 0.007;
    pitch = clamp(pitch + dy * 0.006, -1.25, 1.25);
  });

  function release(event) {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
    auto = true;
    if (moved < 7) {
      const point = pick(event.clientX, event.clientY);
      if (point) selectLocation(point.lat, point.lon, "Dropped pin", true);
    }
  }

  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", (event) => {
    if (dragging && event.pointerType === "mouse") release(event);
  });

  earth.crossOrigin = "anonymous";
  earth.onload = () => {
    const off = document.createElement("canvas");
    off.width = texW;
    off.height = texH;
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.drawImage(earth, 0, 0, texW, texH);
    texture = octx.getImageData(0, 0, texW, texH);
  };
  earth.onerror = () => {
    texture = null;
    setStatus("Earth texture could not load; weather and map still work.", true);
  };
  earth.src = "images/earth.jpg";

  const globeApi = { focus };

  /* ---------------- Leaflet map ---------------- */
  let mapApi = null;
  let firstMapView = true;

  function initMap() {
    const mapEl = document.getElementById("worldMap");
    if (!mapEl) return;
    if (!window.L) {
      mapEl.innerHTML = '<p class="map-unavailable">Map library unavailable. Weather still works.</p>';
      return;
    }

    const map = L.map(mapEl, {
      zoomControl: true,
      scrollWheelZoom: false,
      worldCopyJump: true,
      minZoom: 1,
      maxZoom: 4,
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      attributionControl: true,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1,
    }).setView([state.lat, state.lon], 2.25);

    // The local Blue Marble image keeps the map available even when public
    // tile servers are unreachable. No external map tiles are required.
    L.imageOverlay("images/earth.jpg", [[-85, -180], [85, 180]], {
      opacity: 0.92,
      interactive: false,
      className: "atlas-earth-overlay",
      attribution: "Earth imagery · NASA Blue Marble",
    }).addTo(map);

    const gridStyle = { color: "#59e3d3", weight: 0.6, opacity: 0.12, interactive: false };
    for (let lat = -60; lat <= 60; lat += 30) {
      L.polyline([[lat, -180], [lat, 180]], gridStyle).addTo(map);
    }
    for (let lon = -150; lon <= 150; lon += 30) {
      L.polyline([[-85, lon], [85, lon]], gridStyle).addTo(map);
    }

    const icon = L.divIcon({
      className: "atlas-marker",
      html: "<span></span>",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    const marker = L.marker([state.lat, state.lon], { icon, keyboard: false }).addTo(map);

    map.on("click", (event) => {
      selectLocation(event.latlng.lat, event.latlng.lng, "Dropped pin", true);
    });

    mapApi = {
      update(lat, lon) {
        marker.setLatLng([lat, lon]);
        if (firstMapView) {
          firstMapView = false;
          map.setView([lat, lon], 2.25, { animate: false });
          return;
        }
        map.flyTo([lat, lon], 4, { duration: 1.05 });
      },
    };
    setTimeout(() => map.invalidateSize(), 250);
  }

  /* ---------------- boot ---------------- */
  cityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectLocation(
        Number(button.dataset.lat),
        Number(button.dataset.lon),
        button.dataset.place || "Selected place",
        true
      );
    });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.05 }
    ).observe(canvas);
  }

  initMap();
  requestAnimationFrame(frame);
  selectLocation(19.5, 110, "Hainan, China", false);

  // Keep the reading fresh without hammering the API.
  setInterval(() => {
    if (!document.hidden) loadWeather(state.lat, state.lon, state.place);
  }, 10 * 60 * 1000);
})();
