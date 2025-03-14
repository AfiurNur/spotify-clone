async function displayAlbums() {
    try {
      const response = await fetch(`${window.location.origin}/songs/`);
      const text = await response.text();
      const div = document.createElement("div");
      div.innerHTML = text;
      const anchors = div.querySelectorAll("a[href]");
      const albumContainer = document.querySelector(".album-container");
  
      for (const anchor of anchors) {
        const href = anchor.href;
        if (!href.includes("/songs/") || href.endsWith("/songs/")) continue;
  
        const url = new URL(href);
        const pathSegments = url.pathname.split('/').filter(segment => segment);
        const folderIndex = pathSegments.indexOf('songs');
        const folder = pathSegments[folderIndex + 1];
  
        try {
          const metaResponse = await fetch(`${window.location.origin}/songs/${folder}/info.json`);
          if (!metaResponse.ok) throw new Error('info.json not found');
          const metaData = await metaResponse.json();
  
          // Create album card element
            
  
          // Set data-folder attribute on the correct element
          const playlistCard = albumCard.querySelector('.playlist-card');
          playlistCard.dataset.folder = folder;
  
          // Add click handler to load the album's songs
          playlistCard.addEventListener("click", () => {
            handleFolderChange(`songs/${folder}`);
          });
  
          albumContainer.appendChild(albumCard);
        } catch (error) {
          console.error(`Error processing folder ${folder}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading album list:", error);
    }
  }