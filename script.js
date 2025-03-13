console.log("Spotify Clone by AFIUR NUR");
let currentSong = new Audio();

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songs = []; // Initialize the array to store song URLs

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  return songs;
}

const playNow = (track) => {
  currentSong.src = "/songs/" + track;
  currentSong.play();
  play.src = "pause.svg";
  document.querySelector(".songname").innerHTML = currentSong.src
    .split("/songs/")[1]
    .replaceAll("%20", " ")
    .replaceAll(".mp3", "");
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
  let songs = await getSongs();

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `              <li>
                <div class="image-music">
                  <i class="ri-music-2-line"></i>
                </div>
                <div class="info-container">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Artist</div>
                </div>
                <div class="playnow">
                  <i class="ri-play-circle-line playNow"></i>
                </div>
              </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playNow(e.querySelector(".info-container").firstElementChild.innerHTML);
    });
  });
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
      document.querySelector(".songname").innerHTML = currentSong.src
        .split("/songs/")[1]
        .replaceAll("%20", " ");
      document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = currentSong.currentTime;
    let duration = currentSong.duration;
    let minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);
    let durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    document.querySelector(".songtime").innerHTML =
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds) +
      " / " +
      (durationMinutes < 10 ? "0" + durationMinutes : durationMinutes) +
      ":" +
      (durationSeconds < 10 ? "0" + durationSeconds : durationSeconds);
    document.querySelector(".circle").style.left =
      (currentTime / duration) * 100 + "%";
  });
  currentSong.addEventListener("ended", () => {
    play.src = "play.svg";
  });
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let percentage = x / rect.width;
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    }
    currentSong.currentTime = currentSong.duration * percentage;
    document.querySelector(".circle").style.left = percentage * 100 + "%";
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close-ham").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  document.querySelector(".info-small-screen").addEventListener("click", () => {
    document.querySelector(".songname").style.opacity = "1";
  });
  previous.addEventListener("click", () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/songs/")[1]);
    if (currentIndex > 0) {
      playNow(songs[currentIndex - 1]);
    }
  });
  next.addEventListener("click", () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/songs/")[1]);
    if (currentIndex < songs.length - 1) {
      playNow(songs[currentIndex + 1]);
    }
  });
}

main();
