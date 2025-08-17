// ==== Supabase Config (use ANON key here) ====
const SUPABASE_URL = "https://qdkiqkwkdumzcaqeufmr.supabase.co";   // <-- replace
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2lxa3drZHVtemNhcWV1Zm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMTkzNTIsImV4cCI6MjA3MDc5NTM1Mn0.PoI6-Fc5OMg0Ju-EeVMAgd_O77s2zRaJQyozq6EJh-g";                    // <-- replace

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==== Background color based on time of day ====
function setBackgroundForTime() {
  const hour = new Date().getHours();
  let bg;

  // Morning 6-12, Afternoon 12-17, Evening 17-21, Night 21-6
  if (hour >= 6 && hour < 12) {
    bg = "#FFF7CC"; // Morning - light warm yellow
  } else if (hour >= 12 && hour < 17) {
    bg = "#D9EEFF"; // Afternoon - light sky blue
  } else if (hour >= 17 && hour < 21) {
    bg = "#FFD6A5"; // Evening - soft orange
  } else {
    bg = "#2C3E50"; // Night - deep blue/gray
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

    // Title (plain text)
    const tdTitle = document.createElement("td");
    tdTitle.textContent = row.title ?? "";
    tr.appendChild(tdTitle);

    // Artist
    const tdArtist = document.createElement("td");
    tdArtist.textContent = row.artist ?? "";
    tr.appendChild(tdArtist);

    // Published (format nicely)
    const tdPublished = document.createElement("td");
    tdPublished.textContent = row.published
      ? new Date(row.published).toLocaleString()
      : "";
    tr.appendChild(tdPublished);

    // URL (clickable if present)
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

    // Created At (if present in table)
    const tdCreatedAt = document.createElement("td");
    tdCreatedAt.textContent = row.created_at
      ? new Date(row.created_at).toLocaleString()
      : "-";
    tr.appendChild(tdCreatedAt);

    // ID
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
    .order("published", { ascending: false }); // latest first

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

  // Show last updated time
  const lastUpdated = document.getElementById("lastUpdated");
  lastUpdated.textContent = "Last updated: " + new Date().toLocaleTimeString();
}

// ==== Hook up refresh button ====
document.getElementById("refreshBtn").addEventListener("click", loadSongs);

// Initial load
loadSongs();



