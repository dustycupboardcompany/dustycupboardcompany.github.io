const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const riftSky = document.getElementById('rift-sky');
if (riftSky) {
  riftSky.addEventListener('pointermove', (event) => {
    const rect = riftSky.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    riftSky.style.setProperty('--x', `${x}%`);
    riftSky.style.setProperty('--y', `${y}%`);
  });
}
