const MAX_PAGE = 254;
const pageImage = document.querySelector('#pageImage');
const pageImageRight = document.querySelector('#pageImageRight');
const book = document.querySelector('#book');
const stage = document.querySelector('.stage');
const pageReadout = document.querySelector('#pageReadout');
const floorDisplay = document.querySelector('#floorDisplay');
const pageInput = document.querySelector('#pageInput');
const progressFill = document.querySelector('#progressFill');
const chapterLabel = document.querySelector('#chapterLabel');
const floorTrack = document.querySelector('#floorTrack');
let page = Number(localStorage.getItem('anytime-page')) || 1;
let twoPageView = localStorage.getItem('anytime-two-page') === 'true';
const stops = [1, 5, 7, 18, 25, 31, 45, 51, 60, 69, 77, 83, 93, 102, 107, 119, 125, 141, 145, 159, 176, 190, 202, 204, 210, 221, 228, 236, 242, 247, 251];
const chapters = [{page:1,name:'THE BEGINNING'}, {page:5,name:'PROLOGUE · RAMSES'}, {page:7,name:'THE CHASE'}, {page:100,name:'THE MIDPOINT'}, {page:200,name:'THE LONG WAY HOME'}, {page:254,name:'END OF THE LINE'}];

function fitBookToWindow() {
  const pageRatio = 729 / 1125;
  const spreadRatio = pageRatio * 2;
  const ratio = twoPageView ? spreadRatio : pageRatio;
  const stageWidth = stage.getBoundingClientRect().width;
  const verticalChrome = window.innerWidth <= 540 ? 175 : 168;
  const heightLimit = Math.max(280, window.innerHeight - verticalChrome);
  const width = Math.min(stageWidth, heightLimit * ratio);
  book.style.width = `${Math.floor(width)}px`;
  book.style.height = `${Math.floor(width / ratio)}px`;
}

function setPage(next, direction = 'next') {
  page = Math.max(1, Math.min(MAX_PAGE, Number(next) || 1));
  const pageFile = `pages/page-${String(page).padStart(3, '0')}.jpg`;
  pageImage.src = pageFile;
  pageImage.alt = `Anytime Inc. page ${page}`;
  pageImageRight.src = `pages/page-${String(Math.min(MAX_PAGE, page + 1)).padStart(3, '0')}.jpg`;
  pageImageRight.alt = `Anytime Inc. page ${Math.min(MAX_PAGE, page + 1)}`;
  book.classList.remove('turning'); void book.offsetWidth; book.classList.add('turning');
  pageReadout.textContent = twoPageView && page < MAX_PAGE ? `${String(page).padStart(3, '0')}–${String(page + 1).padStart(3, '0')}` : String(page).padStart(3, '0');
  floorDisplay.textContent = String(page).padStart(3, '0');
  pageInput.value = page;
  progressFill.style.width = `${(page / MAX_PAGE) * 100}%`;
  const active = [...chapters].reverse().find(chapter => page >= chapter.page);
  chapterLabel.textContent = active.name;
  const activeFloorButton = [...document.querySelectorAll('.floor-track button')].find(button => Number(button.dataset.page) === page);
  document.querySelectorAll('.floor-track button').forEach(button => button.classList.toggle('active', button === activeFloorButton));
  localStorage.setItem('anytime-page', page);
  window.history.replaceState({}, '', `#floor-${page}`);
}
stops.forEach(stop => {
  const button = document.createElement('button'); button.textContent = String(stop).padStart(3, '0'); button.dataset.page = stop; button.title = `Travel to page ${stop}`;
  button.addEventListener('click', () => setPage(stop)); floorTrack.append(button);
});
document.querySelector('#nextButton').addEventListener('click', () => setPage(page + (twoPageView ? 2 : 1)));
document.querySelector('#prevButton').addEventListener('click', () => setPage(page - (twoPageView ? 2 : 1), 'prev'));
document.querySelector('#goStart').addEventListener('click', () => setPage(1));
document.querySelector('#jumpButton').addEventListener('click', () => setPage(pageInput.value));
pageInput.addEventListener('keydown', event => { if (event.key === 'Enter') setPage(pageInput.value); });
window.addEventListener('keydown', event => { if (event.target.tagName === 'INPUT') return; if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); setPage(page + (twoPageView ? 2 : 1)); } if (event.key === 'ArrowLeft') { event.preventDefault(); setPage(page - (twoPageView ? 2 : 1), 'prev'); } if (event.key === 'Home') setPage(1); });
const viewToggle = document.querySelector('#viewToggle');
viewToggle.addEventListener('click', () => { twoPageView = !twoPageView; book.classList.toggle('spread', twoPageView); viewToggle.textContent = twoPageView ? '2-UP' : '1-UP'; viewToggle.setAttribute('aria-pressed', twoPageView); viewToggle.title = twoPageView ? 'Switch to one-page view' : 'Switch to two-page view'; localStorage.setItem('anytime-two-page', twoPageView); fitBookToWindow(); setPage(page); });
document.querySelector('#infoButton').addEventListener('click', () => document.querySelector('#infoDialog').showModal());
document.querySelector('#closeInfo').addEventListener('click', () => document.querySelector('#infoDialog').close());
document.querySelector('#fullscreenButton').addEventListener('click', () => document.querySelector('.stage').requestFullscreen?.());
const mediaDialog = document.querySelector('#mediaDialog');
const galleryView = document.querySelector('#galleryView');
const trailerView = document.querySelector('#trailerView');
const trailerVideo = document.querySelector('#trailerVideo');
const galleryImage = document.querySelector('#galleryImage');
const galleryCount = document.querySelector('#galleryCount');
let galleryIndex = 0;
const galleryImages = Array.from({ length: 6 }, (_, index) => `assets/gallery/scene-${String(index + 1).padStart(2, '0')}.jpg`);
function showGalleryImage() { galleryImage.src = galleryImages[galleryIndex]; galleryImage.alt = `LIFTED Steam screenshot ${galleryIndex + 1}`; galleryCount.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / 06`; }
function openMedia(mode) { galleryView.hidden = mode !== 'gallery'; trailerView.hidden = mode !== 'trailer'; if (mode === 'gallery') showGalleryImage(); mediaDialog.showModal(); }
document.querySelector('#galleryButton').addEventListener('click', () => openMedia('gallery'));
document.querySelector('#trailerButton').addEventListener('click', () => openMedia('trailer'));
document.querySelector('#galleryPrevious').addEventListener('click', () => { galleryIndex = (galleryIndex + galleryImages.length - 1) % galleryImages.length; showGalleryImage(); });
document.querySelector('#galleryNext').addEventListener('click', () => { galleryIndex = (galleryIndex + 1) % galleryImages.length; showGalleryImage(); });
document.querySelector('#closeMedia').addEventListener('click', () => mediaDialog.close());
mediaDialog.addEventListener('close', () => { trailerVideo.pause(); trailerVideo.currentTime = 0; });
book.classList.toggle('spread', twoPageView);
viewToggle.textContent = twoPageView ? '2-UP' : '1-UP';
viewToggle.setAttribute('aria-pressed', twoPageView);
window.addEventListener('resize', fitBookToWindow);
fitBookToWindow();
setPage(location.hash.match(/\d+/)?.[0] || page);
