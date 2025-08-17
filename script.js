// ==== Supabase Config (keys come from config.js) ====
const SUPABASE_URL = SUPABASE_URL;     // defined in config.js
const SUPABASE_ANON_KEY = SUPABASE_ANON_KEY; // defined in config.js

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==== Background color based on time of day ====
function setBackgroundForTime() {
  const hour = new Date().getHours();
  let bg;

  if (hour >= 6 && hour < 12) {
    bg = "#FFF7CC"; // Morning
  } else if (hour >= 12 && hour < 17) {
    bg = "#D9EEFF"; // Afternoon
  } else if (hour >= 17 && hour < 21) {
    bg = "#FFD6A5"; // Evening
  } else {
    bg = "#2C3E50"; // Night
  }

  document.body.style.backgroundColor = bg;
}
setBackgroundForTime();

// ==== Render rows into table ====
function renderSongs(rows) {
  const tbody = document.querySelector("#songsTable tbody");
  tbody.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = row.title ?? "";
    tr.appendChild(tdTitle);

    const tdArtist = document.createElement("td");
    tdArtist.textContent = row.artist ?? "";
    tr.appendChild(tdArtist);

    const tdPublished = document.createElement("td");
    tdPublished.textContent = row.published
      ? new Date(row.published).toLocaleString()
      : "";
    tr.appendChild(tdPublished);

    const tdUrl = document.createElement("td");
    if (row.url) {
      const a = document.createElement("a");
      a.href = row.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open";
      a.className = "link";
      tdUrl.appendChild(a);
    } else {
      tdUrl.textContent = "-";
    }
    tr.appendChild(tdUrl);

    const tdCreatedAt = document.createElement("td");
    tdCreatedAt.textContent = row.created_at
      ? new Date(row.created_at).toLocaleString()
      : "-";
    tr.appendChild(tdCreatedAt);

    const tdId = document.createElement("td");
    tdId.textContent = row.id ?? "-";
    tr.appendChild(tdId);

    tbody.appendChild(tr);
  });
}

// ==== Load all songs from table ====
async function loadSongs() {
  const status = document.getElementById("status");
  status.textContent = "Loading songs...";

  const { data, error } = await db
    .from("song")
    .select("*")
    .order("published", { ascending: false });

  if (error) {
    console.error("Error fetching songs:", error);
    status.textContent = "⚠️ Failed to load songs.";
    return;
  }

  if (!data || data.length === 0) {
    status.textContent = "No songs found.";
    renderSongs([]);
  } else {
    status.textContent = "";
    renderSongs(data);
  }

  const lastUpdated = document.getElementById("lastUpdated");
  lastUpdated.textContent = "Last updated: " + new Date().toLocaleTimeString();
}

// ==== Hook up refresh button ====
document.getElementById("refreshBtn").addEventListener("click", loadSongs);

// Initial load
loadSongs();
