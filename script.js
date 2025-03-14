console.log("Spotify Clone by AFIUR NUR");
let currentSong = new Audio();
let currentFolder;
let currentSongIndex = -1;
let songs = [];

async function getSongs(folder) {
  currentFolder = folder;
  try {
    const response = await fetch(`${window.location.origin}/${folder}/`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const links = doc.querySelectorAll("a[href$='.mp3']");

    return Array.from(links).map((link) => {
      const url = new URL(link.href);
      const pathParts = url.pathname.split(`/${folder}/`);
      const encodedName = pathParts[1];
      return {
        filename: encodedName,
        name: decodeURIComponent(encodedName.replace(/\.mp3$/, "")),
      };
    });
  } catch (error) {
    console.error("Error loading songs:", error);
    return [];
  }
}

function playNow(filename) {
  const song = songs.find((s) => s.filename === filename);
  if (!song) return;

  currentSongIndex = songs.indexOf(song);
  currentSong.src = `/${currentFolder}/${song.filename}`;
  currentSong.play();

  document.querySelector(".songname").textContent = song.name;
  play.src = "pause.svg";
}

function renderSongsList(songsArray) {
  const songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";

  songsArray.forEach((song) => {
    const li = document.createElement("li");
    li.dataset.filename = song.filename;
    li.innerHTML = `
      <div class="image-music">
        <i class="ri-music-2-line"></i>
      </div>
      <div class="info-container">
        <div>${song.name}</div>
        <div>Artist</div>
      </div>
      <div class="playnow">
        <i class="ri-play-circle-line playNow"></i>
      </div>
    `;
    songUl.appendChild(li);
  });

  // Attach event listeners to new song items
  Array.from(songUl.children).forEach((li) => {
    li.addEventListener("click", () => playNow(li.dataset.filename));
  });
}

function updateTimeDisplay() {
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  document.querySelector(".songtime").textContent = `${formatTime(
    currentSong.currentTime
  )} / ${formatTime(currentSong.duration)}`;

  const progress = (currentSong.currentTime / currentSong.duration) * 100 || 0;
  document.querySelector(".circle").style.left = `${progress}%`;
}

async function handleFolderChange(folder) {
  currentSong.pause();
  play.src = "play.svg";
  currentSongIndex = -1;
  songs = await getSongs(folder);
  renderSongsList(songs);
}

async function displayAlbums() {
  try {
    const response = await fetch(`${window.location.origin}/songs/`);
    const text = await response.text();
    const div = document.createElement("div");
    div.innerHTML = text;
    const anchors = div.querySelectorAll("a[href]");

    for (const anchor of anchors) {
      const href = anchor.href;
      // Skip if not a directory under /songs/
      if (!href.includes("/songs/") || href.endsWith("/songs/")) continue;

      // Extract folder name from URL
      const url = new URL(href);
      const pathSegments = url.pathname.split("/").filter((segment) => segment);
      const folderIndex = pathSegments.indexOf("songs");
      const folder = pathSegments[folderIndex + 1];

      try {
        // Fetch album metadata
        const metaResponse = await fetch(
          `${window.location.origin}/songs/${folder}/info.json`
        );
        if (!metaResponse.ok) throw new Error("info.json not found");
        const metaData = await metaResponse.json();

        // Create album card element
        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `<div class="playlistCard">
              <div data-folder="${metaData.folderName}" class="playlist-card flex">
                <img
                  src="/songs/${folder}/cover.jpg"
                  alt="album-image"
                />
                <button class="btn-none">
                  <i class="ri-play-fill right-play"></i>
                </button>
                <div class="playlost-info">
                  <h2>${metaData.title}</h2>
                  <p>
                    ${metaData.description}
                  </p>
                </div>
              </div>
            </div>`;

        // Playlist navigation
        Array.from(document.getElementsByClassName("playlist-card")).forEach(
          (card) => {
            card.addEventListener("click", () => {
              const folder = `songs/${card.dataset.folder}`;
              handleFolderChange(folder);
            });
          }
        );
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
      }
    }
  } catch (error) {
    console.error("Error loading album list:", error);
  }
}

async function main() {
  // Initial load
  songs = await getSongs("songs/ncs");
  renderSongsList(songs);

  // display Albums
  displayAlbums();

  // Player controls
  play.addEventListener("click", () => {
    if (songs.length === 0) return;

    if (currentSong.paused) {
      if (currentSongIndex === -1) currentSongIndex = 0;
      playNow(songs[currentSongIndex].filename);
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Progress bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const rect = e.target.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    currentSong.currentTime = percentage * currentSong.duration;
  });

  // Track time updates
  currentSong.addEventListener("timeupdate", updateTimeDisplay);

  // Handle song ending
  currentSong.addEventListener("ended", () => {
    if (currentSongIndex < songs.length - 1) {
      currentSongIndex++;
      playNow(songs[currentSongIndex].filename);
    } else {
      play.src = "play.svg";
    }
  });

  // Navigation controls
  previous.addEventListener("click", () => {
    if (currentSongIndex > 0) {
      currentSongIndex--;
      playNow(songs[currentSongIndex].filename);
    }
  });

  next.addEventListener("click", () => {
    if (currentSongIndex < songs.length - 1) {
      currentSongIndex++;
      playNow(songs[currentSongIndex].filename);
    }
  });

  // Mobile menu toggle
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close-ham").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
}

main();
