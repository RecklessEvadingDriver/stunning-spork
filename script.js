function getData(download) {
  const urlInput = document.querySelector("#url");
  if (!urlInput || !urlInput.value) {
    alert("Please enter a valid URL.");
    return;
  }

  const urlParts = urlInput.value.split("/");
  const value = urlParts[urlParts.length - 1]?.slice(1);
  if (!value) {
    alert("Invalid URL format.");
    return;
  }

  const baseUrl = "https://terabox-backend.onrender.com/";
  const preUrl = `${baseUrl}get_data?url=`;

  // Construct the API URL
  const apiUrl = preUrl + encodeURIComponent(
    `https://www.4funbox.com/share/list?app_id=250528&web=1&clienttype=0&page=1&num=20&order=time&desc=1&site_referer=&root=1&shorturl=${value}`
  );

  // Fetch data from the backend
  fetch(apiUrl, {
    headers: {
      "Connection": "keep-alive",
      "Cache-Control": "max-age=0",
      "Upgrade-Insecure-Requests": "1",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "origin, content-type, accept, x-requested-with",
      "Access-Control-Max-Age": "3600",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Sec-GPC": "1",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Mode": "navigate",
      "Content-Type": "application/json",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch video data");
      return res.json();
    })
    .then((res) => {
      if (!res.list || !res.list[0]?.dlink) {
        throw new Error("No video link found.");
      }

      if (download) {
        // Open the download link in a new tab
        window.open(res.list[0].dlink, "_blank");
      } else {
        // Construct the video stream URL
        const streamUrl = `${baseUrl}get_stream?uk=${res.uk}&share_id=${res.share_id}&fid=${res.list[0].fs_id}`;

        // Set the video source dynamically
        const videoElement = document.getElementById("video");
        if (videoElement) {
          videoElement.innerHTML = `<source src='${streamUrl}' type='application/x-mpegURL'>`;
          const player = videojs("video");
          player.play();
        } else {
          console.error("Video element not found.");
        }
      }
    })
    .catch((error) => {
      console.error(error);
      alert("An error occurred while processing your request.");
    });
}

// Attach event listeners
$(document).ready(function () {
  $("#btn").on("click", function () {
    getData(false); // Play video
  });

  $("#download").on("click", function () {
    getData(true); // Download video
  });
});
