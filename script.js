// Función para parsear el contenido LRC y extraer timecodes y líneas
function parseLRC(lrcText) {
  const lines = lrcText.split('\n');
  const lrcData = [];
  const regex = /\[(\d{2}):(\d{2}(?:\.\d{2})?)\](.*)/;
  lines.forEach(line => {
    const match = regex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const text = match[3].trim();
      lrcData.push({ time, text });
    }
  });
  return lrcData;
}

// Función para mostrar la letra en el contenedor
function displayLyrics(lrcData) {
  const container = document.getElementById('lyrics-container');
  container.innerHTML = ''; // Limpiar contenido previo
  lrcData.forEach(item => {
    const p = document.createElement('p');
    p.classList.add('lyric-line');
    p.setAttribute('data-time', item.time);
    p.textContent = item.text;
    container.appendChild(p);
  });
}

// Función para sincronizar la letra (karaoke) con el video de fondo HTML5
function syncKaraoke(lrcData) {
  const backgroundVideo = document.getElementById("background-video");
  const lyricLines = document.querySelectorAll(".lyric-line");

  backgroundVideo.addEventListener("timeupdate", function() {
    const currentTime = backgroundVideo.currentTime;
    for (let i = 0; i < lrcData.length; i++) {
      const startTime = lrcData[i].time;
      const endTime = (i < lrcData.length - 1) ? lrcData[i + 1].time : Infinity;
      if (currentTime >= startTime && currentTime < endTime) {
        // Quitar la clase 'active' de todas las líneas
        lyricLines.forEach(line => line.classList.remove('active'));
        // Activar la línea correspondiente y desplazarla suavemente sin forzar demasiado el scroll
        if (lyricLines[i]) {
          lyricLines[i].classList.add('active');
          lyricLines[i].scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        break;
      }
    }
  });
}

// Función para cargar el archivo LRC y preparar la sincronización
function fetchLRC() {
  fetch('stand_by_me.lrc')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo LRC');
      }
      return response.text();
    })
    .then(text => {
      const lrcData = parseLRC(text);
      displayLyrics(lrcData);
      syncKaraoke(lrcData);
    })
    .catch(error => {
      console.error("Error al obtener el archivo LRC:", error);
      document.getElementById('lyrics-container').innerHTML = '<p>Error al cargar la letra.</p>';
    });
}

// Actualiza la sincronización cuando la página vuelve a ser visible
document.addEventListener("visibilitychange", function() {
  if (!document.hidden) {
    const backgroundVideo = document.getElementById("background-video");
    backgroundVideo.dispatchEvent(new Event("timeupdate"));
  }
});

// Configuraciones iniciales al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  const backgroundVideo = document.getElementById("background-video");
  if (backgroundVideo && backgroundVideo.play) {
    backgroundVideo.play().catch(err => console.error("Error al iniciar el video de fondo:", err));
  }
  
  // Botón para activar/desactivar el sonido del video de fondo
  document.getElementById("toggle-sound").addEventListener("click", function() {
    if (backgroundVideo) {
      if (backgroundVideo.muted) {
        backgroundVideo.muted = false;
        this.textContent = "Silenciar 🔇";
      } else {
        backgroundVideo.muted = true;
        this.textContent = "Activar Sonido 🔊";
      }
    }
  });
  
  // Cargar y sincronizar la letra desde el archivo LRC
  fetchLRC();
});
