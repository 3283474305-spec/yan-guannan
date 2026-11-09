# Yan Guannan — Interfaces with a pulse

Personal website for **Yan Guannan (严冠男)**, a student at Hainan Bielefeld University of Applied Sciences (BIUH).

- Student ID: `X20250013`
- Email: `X20250013@stu.hibiuh.edu.cn`
- Location: Hainan, China

## What is inside

- Weather-first art direction with a live conditions card in the hero
- Interactive **Topography** WebGL background (React Bits)
- A 3D-tilting live weather/student card
- About, selected work and contact sections
- **Weather**: a draggable Earth globe, clickable locations, a global map, live weather and a five-day forecast
- **Bilingual search**: search in English or Chinese (e.g. `Tokyo` / `东京`, `Beijing` / `北京`)
- **Daily tools**: a live “Dress for the sky” outfit planner and a temperature/wind/rain converter
- **Signal Grid**: a 30-second reaction game with score, streak, timer, sound and a local best score
- Fully responsive, image-free design

## Atlas notes

- Click or drag the globe to rotate it; click a point to select it.
- Click the local map or use the Hainan / Beijing / Tokyo / London / New York / Sydney chips.
- Weather comes from **Open-Meteo** (no API key).
- Place names come from **BigDataCloud reverse geocoding**.
- The map uses local **NASA Blue Marble** imagery, so it still works when tile servers are unavailable.
- Weather refreshes when a new place is selected and every 10 minutes while the page is open.
- Common world cities have bilingual aliases; other places use Open-Meteo geocoding.

## Run locally

From this folder:

```bash
python -m http.server 8788
```

Open <http://127.0.0.1:8788/>.

## Deploy

This is a static site. Upload the contents of this folder to any static host (Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel, or a regular web server).

For GitHub Pages, set the repository root as the Pages source. Keep all files together so `css/`, `js/`, `images/`, `vendor/` and `index.html` stay in the same structure.

## Credits

- Typography: Playfair Display, Inter and Space Grotesk (Google Fonts)
- Background: `Topography` from React Bits
- Globe/map imagery: NASA Blue Marble
- Map library: Leaflet
- Weather: Open-Meteo
- Reverse geocoding: BigDataCloud
