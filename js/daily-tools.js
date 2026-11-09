/* Daily tools — outfit planner from live weather + quick converter */
(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const tempEl = $("#outfitTemp");
  const iconEl = $("#outfitIcon");
  const conditionEl = $("#outfitCondition");
  const placeEl = $("#outfitPlace");
  const noteEl = $("#outfitNote");
  const layerEl = $("#outfitLayer");
  const layerNoteEl = $("#outfitLayerNote");
  const carryEl = $("#outfitCarry");
  const carryNoteEl = $("#outfitCarryNote");
  const extraEl = $("#outfitExtra");
  const extraNoteEl = $("#outfitExtraNote");
  const markerEl = $("#outfitMarker");

  const convButtons = Array.from(document.querySelectorAll("[data-conv]"));
  const convInput = $("#convInput");
  const convFrom = $("#convFrom");
  const convResult = $("#convResult");
  const convHint = $("#convHint");

  let lastWeather = window.__lastWeather || null;
  let lastTemp = 24;
  let convMode = "temp";
  let convTouched = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function applyWeather(data) {
    if (!data) return;
    lastWeather = data;
    lastTemp = Number(data.temp);

    if (tempEl) tempEl.textContent = `${Math.round(data.temp)}°`;
    if (iconEl) iconEl.textContent = data.icon || "◌";
    if (conditionEl) conditionEl.textContent = data.label || "Current conditions";
    if (placeEl) placeEl.textContent = `${data.place} · local time ${data.time}`;
    if (noteEl) {
      noteEl.textContent = `Feels like ${Math.round(data.feels)}° · humidity ${data.humidity}% · wind ${data.wind} km/h`;
    }

    let layer = "Light layer";
    let layerNote = "A shirt or thin knit should do.";
    if (data.temp <= 5) {
      layer = "Heavy coat";
      layerNote = "Thermal base, proper coat, warm socks.";
    } else if (data.temp <= 12) {
      layer = "Warm coat";
      layerNote = "Coat and a knit over a long-sleeve.";
    } else if (data.temp <= 18) {
      layer = "Jacket";
      layerNote = "Light jacket over a tee.";
    } else if (data.temp <= 24) {
      layer = "Light layer";
      layerNote = "Shirt or thin knit; easy to remove.";
    } else if (data.temp <= 29) {
      layer = "T-shirt";
      layerNote = "Breathable cotton and light trousers.";
    } else {
      layer = "Loose & light";
      layerNote = "Linen, shade and a cold drink.";
    }

    let carry = "Water bottle";
    let carryNote = "Keep it within reach.";
    const rainyCode = data.code >= 51 && data.code < 100;
    if (data.rain > 0 || rainyCode) {
      carry = "Umbrella";
      carryNote = "Rain is in the current reading.";
    } else if (data.wind >= 25) {
      carry = "Windproof";
      carryNote = `Breezy at ${data.wind} km/h.`;
    } else if (data.isDay && data.code <= 1) {
      carry = "Sunglasses";
      carryNote = "A bright sky outside.";
    }

    let extra = "Lighter bag";
    let extraNote = "Nothing else is asking for attention.";
    if (data.humidity >= 80) {
      extra = "Dry bag";
      extraNote = `Humidity is ${data.humidity}%.`;
    } else if (data.temp >= 30) {
      extra = "Sun protection";
      extraNote = "High heat — cover up and refill water.";
    } else if (data.temp <= 10) {
      extra = "Warm socks";
      extraNote = "Keep the extremities warm.";
    } else if (data.code === 45 || data.code === 48) {
      extra = "Leave earlier";
      extraNote = "Visibility is low in the fog.";
    }

    if (layerEl) layerEl.textContent = layer;
    if (layerNoteEl) layerNoteEl.textContent = layerNote;
    if (carryEl) carryEl.textContent = carry;
    if (carryNoteEl) carryNoteEl.textContent = carryNote;
    if (extraEl) extraEl.textContent = extra;
    if (extraNoteEl) extraNoteEl.textContent = extraNote;

    if (markerEl) {
      const pct = clamp((data.temp + 5) / 40, 0, 1) * 100;
      markerEl.style.left = `${pct.toFixed(1)}%`;
    }

    if (convMode === "temp" && !convTouched) {
      if (convInput) convInput.value = String(Math.round(data.temp));
      updateConverter();
    }
  }

  document.addEventListener("weather:update", (event) => applyWeather(event.detail));

  /* ---------- converter ---------- */
  const MODES = {
    temp: { from: "°C", to: "°F", default: 24, convert: (v) => v * 1.8 + 32, decimals: 1 },
    wind: { from: "km/h", to: "mph", default: 20, convert: (v) => v * 0.621371, decimals: 1 },
    rain: { from: "mm", to: "in", default: 10, convert: (v) => v / 25.4, decimals: 2 },
  };

  function updateConverter() {
    const mode = MODES[convMode];
    if (!mode) return;
    const value = Number(convInput?.value);
    if (convFrom) convFrom.textContent = mode.from;
    if (!Number.isFinite(value)) {
      if (convResult) convResult.textContent = "—";
      if (convHint) convHint.textContent = "Enter a number to convert.";
      return;
    }
    const converted = mode.convert(value);
    const rounded = Number(converted.toFixed(mode.decimals));
    if (convResult) convResult.textContent = `${rounded} ${mode.to}`;
    if (convHint) convHint.textContent = `${value} ${mode.from} = ${rounded} ${mode.to}.`;
  }

  convButtons.forEach((button) => {
    button.addEventListener("click", () => {
      convMode = button.dataset.conv;
      convTouched = false;
      convButtons.forEach((item) => item.classList.toggle("active", item === button));
      if (convInput) {
        convInput.value = String(
          convMode === "temp" && lastWeather ? Math.round(lastTemp) : MODES[convMode].default
        );
      }
      updateConverter();
    });
  });

  convInput?.addEventListener("input", () => {
    convTouched = true;
    updateConverter();
  });

  if (lastWeather) applyWeather(lastWeather);
  updateConverter();
})();
