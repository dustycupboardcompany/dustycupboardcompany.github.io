const state = {
  mode: 'payload',
  age: 'all',
  cart: [],
  idleTimer: null,
  gateTimer: null,
  reviewOpen: false,
  isDragging: false
};

const taxRate = 0.0875;
const $ = id => document.getElementById(id);
const money = n => '$' + n.toFixed(2);
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());

function filteredItems(){
  if(state.mode === 'payload') return MENU_ITEMS.filter(i => i.type === 'payload');
  return MENU_ITEMS.filter(i => i.type === 'kicker' && (state.age === 'adult' ? i.ageRestricted : !i.ageRestricted));
}

function makeSectionTitle(text){
  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = text.toUpperCase();
  return title;
}

function renderMenu(){
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === state.mode));
  $('ageToggle').classList.toggle('hidden', state.mode !== 'kicker');
  document.querySelectorAll('.age-btn').forEach(b => b.classList.toggle('active', b.dataset.age === state.age));

  const mount = $('categoryMount');
  mount.className = 'category-mount ' + (state.mode === 'payload' ? 'payload-layout' : ('kicker-layout ' + (state.age === 'adult' ? 'adult-layout' : 'allages-layout')));
  mount.innerHTML = '';
  const items = filteredItems();

  if(state.mode === 'payload'){
    mount.appendChild(makeSectionTitle('Payload Bits'));
    const grid = document.createElement('div');
    grid.className = 'grid food';
    items.forEach(i => grid.appendChild(card(i)));
    mount.appendChild(grid);
    return;
  }

  if(state.age === 'all'){
    const soda = items.filter(i => i.section === 'Soda-Tap');
    const escape = items.filter(i => i.escapeRum);
    const specialty = items.filter(i => i.section === 'Specialty' && !i.escapeRum);
    mount.appendChild(kickerCategoryGroup('Soda-Tap', gridFor(soda, 'drinks6'), 'top-category'));
    mount.appendChild(questBand(escape));
    mount.appendChild(kickerCategoryGroup('Specialty', gridFor(specialty, 'drinks3 compact-specialty'), 'bottom-category'));
  } else {
    const draft = items.filter(i => i.section === 'Draft Tap Beer & Wine');
    const escape = items.filter(i => i.escapeRum);
    const specialty = items.filter(i => i.section === 'Specialty Alcoholic' && !i.escapeRum);
    mount.appendChild(kickerCategoryGroup('Draft Tap Beer & Wine', gridFor(draft, 'drinks6'), 'top-category'));
    mount.appendChild(questBand(escape));
    mount.appendChild(kickerCategoryGroup('Specialty Alcoholic', gridFor(specialty, 'drinks5 compact-specialty'), 'bottom-category'));
  }
}

function gridFor(arr, cls){
  const grid = document.createElement('div');
  grid.className = 'grid ' + cls;
  arr.forEach(i => grid.appendChild(card(i)));
  return grid;
}

function kickerCategoryGroup(label, content, cls=''){
  const wrap = document.createElement('section');
  wrap.className = 'kicker-category-group ' + cls;
  wrap.appendChild(makeSectionTitle(label));
  wrap.appendChild(content);
  return wrap;
}

function questBand(arr){
  const band = document.createElement('section');
  band.className = 'quest-band';
  band.innerHTML = `
    <div class="quest-title">
      <div class="quest-emblem"><span>⌂</span></div>
      <div class="quest-copy">
        <b>ESCAPE RŪM</b>
        <span>${state.age === 'adult' ? 'Story-driven cocktail quests' : 'Self-guided drink quests'}</span>
        <p>${state.age === 'adult'
          ? "Each drink unlocks clues tied to your seat, surroundings, and screen."
          : "Zero-proof versions of Byte’s signature puzzle drinks."}</p>
      </div>
    </div>`;
  const grid = document.createElement('div');
  grid.className = 'quest-card-grid';
  arr.forEach(i => grid.appendChild(card(i)));
  band.appendChild(grid);
  return band;
}

function card(i){
  const el = document.createElement('article');
  const sectionClass = i.type === 'kicker'
    ? (' section-' + (i.escapeRum ? 'escape' : (i.section || 'kicker')).toLowerCase().replace(/[^a-z0-9]+/g,'-'))
    : '';
  el.className = 'item-card' + (i.type === 'kicker' ? ' kicker' : '') + sectionClass + (i.ageRestricted ? ' adult' : '') + (i.escapeRum ? ' escape' : '');
  el.dataset.code = i.code;
  el.innerHTML = `
    <div class="code">${i.code}</div>
    <img class="item-img" src="${i.image}" alt="${i.name}">
    <div class="item-info"><div class="item-name">${i.name}</div><div class="price">${money(i.price)}</div></div>
    ${i.escapeRum ? '<div class="mini-tag">ESCAPE RŪM</div>' : ''}
    <button class="plus" aria-label="Add"><span class="plus-icon">+</span></button>`;
  el.addEventListener('pointerup', () => addItem(i, el));
  return el;
}

function addItem(item, sourceEl){
  const wasStatic = state.cart.length <= 8;
  const instance = {...item, instanceId: uuid()};
  state.cart.push(instance);
  animateBit(item, sourceEl);
  showInsertGate(instance);
  renderBitstream({preserveMotion:true});
  if(state.reviewOpen) renderReview();

  if(wasStatic && state.cart.length === 9 && !state.reviewOpen){
    $('bitstreamTrack').classList.remove('idle-scroll');
    setTimeout(() => armIdleBitstream(), 650);
  }
}

function showInsertGate(item){
  if(state.reviewOpen) return;
  const gate = $('insertGate');
  gate.innerHTML = '';
  const tile = bitTile(item);
  tile.classList.add('gate-tile');
  gate.appendChild(tile);
  gate.classList.remove('hidden','merge','active','loading');
  void gate.offsetWidth;
  gate.classList.add('active');
  clearTimeout(state.gateTimer);
  state.gateTimer = setTimeout(() => gate.classList.add('loading'), 180);
  state.gateTimer = setTimeout(() => {
    gate.classList.remove('loading');
    gate.classList.add('merge');
    setTimeout(() => {
      gate.classList.remove('active','merge');
      gate.innerHTML = '';
    }, 520);
  }, 1280);
}

function animateBit(item, sourceEl){
  if(state.reviewOpen) return;
  const start = sourceEl.getBoundingClientRect();
  const target = ($('insertGate') || $('bitstreamViewport')).getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'flyer ' + (item.type === 'kicker' ? 'amber' : 'cyan');
  f.textContent = item.code;
  f.style.left = start.left + 20 + 'px';
  f.style.top = start.top + 10 + 'px';
  document.body.appendChild(f);
  requestAnimationFrame(() => {
    f.style.left = (target.left + target.width * .5 - 16) + 'px';
    f.style.top = (target.top + target.height * .5 - 13) + 'px';
    f.style.opacity = '.12';
    f.style.transform = 'translateY(-18px) scale(.64) rotate(7deg)';
  });
  setTimeout(() => f.remove(), 760);
  sourceEl.classList.add('pulse');
  setTimeout(() => sourceEl.classList.remove('pulse'), 420);
}

function chunk(arr, size){
  const out = [];
  for(let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function emptySlot(){
  const slot = document.createElement('div');
  slot.className = 'slot empty';
  return slot;
}

function bitTile(item){
  const t = document.createElement('div');
  t.className = 'bit-tile ' + (item.type === 'kicker' ? 'amber' : 'cyan');
  t.textContent = item.code;
  return t;
}


function reviewBitCell(item){
  const cell = document.createElement('div');
  cell.className = 'review-conveyor-bit' + (item ? (' ' + (item.type === 'kicker' ? 'amber' : 'cyan')) : ' empty');
  cell.textContent = item ? item.code : '';
  return cell;
}

function reviewNybbleCapsule(items, index, isCurrent=false){
  const capsule = document.createElement('div');
  capsule.className = 'review-conveyor-nybble' + (isCurrent ? ' current' : '') + (items.length === 4 ? ' locked' : '') + (!items.length ? ' empty' : '');

  const label = document.createElement('div');
  label.className = 'review-conveyor-label';
  label.textContent = 'NYBBLE ' + String(index + 1).padStart(2, '0');
  capsule.appendChild(label);

  const row = document.createElement('div');
  row.className = 'review-conveyor-row';
  for(let i = 0; i < 4; i++) row.appendChild(reviewBitCell(items[i] || null));
  capsule.appendChild(row);

  return capsule;
}

function reviewByteDivider(isActive=false){
  const divider = document.createElement('div');
  divider.className = 'review-conveyor-divider' + (isActive ? ' active' : '');
  return divider;
}

function buildReviewConveyorCopy(){
  const copy = document.createElement('div');
  copy.className = 'review-conveyor-copy';

  const groups = chunk(state.cart, 4);
  const nibbleCount = Math.max(1, groups.length);
  const currentIndex = Math.max(0, groups.length - 1);

  copy.appendChild(reviewConveyorFlourish('left'));

  for(let n = 0; n < nibbleCount; n++){
    const items = groups[n] || [];
    const isCurrent = state.cart.length > 0 && n === currentIndex && items.length < 4;
    copy.appendChild(reviewNybbleCapsule(items, n, isCurrent));

    // small dash between nybbles; slightly stronger marker between completed bytes
    if(n < nibbleCount - 1){
      const nextStartsByte = n % 2 === 1;
      copy.appendChild(reviewByteDivider(nextStartsByte));
    }
  }

  copy.appendChild(reviewConveyorFlourish('right'));
  return copy;
}

function reviewConveyorFlourish(side){
  const el = document.createElement('div');
  el.className = 'review-conveyor-flourish ' + side;
  return el;
}

function renderReviewBitstream(){
  const track = $('bitstreamTrack');
  const viewport = $('bitstreamViewport');

  viewport.classList.add('review-conveyor-viewport');
  track.className = 'bitstream-track review-conveyor-track';
  track.innerHTML = '';

  const first = buildReviewConveyorCopy();
  const second = buildReviewConveyorCopy();
  second.classList.add('clone');

  track.appendChild(first);
  track.appendChild(second);

  requestAnimationFrame(() => {
    const gap = 12;
    const distance = Math.ceil(first.getBoundingClientRect().width + gap);
    track.style.setProperty('--review-conveyor-distance', distance + 'px');
    track.classList.remove('running');
    void track.offsetWidth;
    track.classList.add('running');
  });
}

function renderMenuBitstream(opts={}){
  const track = $('bitstreamTrack');
  const viewport = $('bitstreamViewport');
  viewport.classList.remove('review-conveyor-viewport');
  track.className = 'bitstream-track';

  const wasMoving = track.classList.contains('idle-scroll');
  track.innerHTML = '';

  const byteGroups = chunk(state.cart, 8);
  if(!byteGroups.length) byteGroups.push([]);

  const buildSet = (asClone=false) => {
    byteGroups.forEach((byte, byteIndex) => {
      const byteProgress = Math.min(byte.length / 8, 1);
      const byteWrap = document.createElement('div');
      byteWrap.className = 'byte-wrap' + (byte.length === 8 ? ' locked' : '') + (byte.length ? ' forming' : ' empty-byte') + (asClone ? ' loop-clone' : '');
      byteWrap.style.setProperty('--byte-progress', byteProgress);
      byteWrap.style.setProperty('--byte-trace', Math.round(byteProgress * 100) + '%');

      const byteBody = document.createElement('div');
      byteBody.className = 'byte-body';

      for(let n = 0; n < 2; n++){
        const nybbleItems = byte.slice(n * 4, n * 4 + 4);
        const nybbleProgress = Math.min(nybbleItems.length / 4, 1);
        const nybble = document.createElement('div');
        nybble.className = 'nybble-wrap' + (nybbleItems.length === 4 ? ' locked' : '') + (nybbleItems.length ? ' forming' : ' empty-nybble');
        nybble.style.setProperty('--nybble-progress', nybbleProgress);
        nybble.style.setProperty('--nybble-trace', Math.round(nybbleProgress * 100) + '%');

        const nybbleLabel = document.createElement('div');
        nybbleLabel.className = 'nybble-label';
        nybbleLabel.textContent = 'NYBBLE ' + String(byteIndex * 2 + n + 1).padStart(2,'0');
        nybble.appendChild(nybbleLabel);

        const row = document.createElement('div');
        row.className = 'nybble-row';
        for(let i=0;i<4;i++) row.appendChild(nybbleItems[i] ? bitTile(nybbleItems[i]) : emptySlot());
        nybble.appendChild(row);
        byteBody.appendChild(nybble);
      }
      byteWrap.appendChild(byteBody);
      track.appendChild(byteWrap);
    });
  };

  buildSet(false);
  if(state.cart.length > 8 && !state.reviewOpen) buildSet(true);

  $('reviewBtn').classList.toggle('ready', state.cart.length > 0);

  if(opts.holdStill){
    track.classList.remove('idle-scroll');
    viewport.scrollLeft = 0;
    return;
  }

  if(state.cart.length > 0){
    if(opts.preserveMotion && wasMoving) track.classList.add('idle-scroll');
    else armIdleBitstream();
  } else {
    track.classList.remove('idle-scroll');
    viewport.scrollLeft = 0;
  }
}

function renderBitstream(opts={}){
  $('reviewBtn').classList.toggle('ready', state.cart.length > 0);

  if(state.reviewOpen){
    renderReviewBitstream();
    return;
  }

  renderMenuBitstream(opts);
}

function armIdleBitstream(){
  const vp = $('bitstreamViewport');
  const track = $('bitstreamTrack');
  vp.scrollLeft = 0;

  if(state.reviewOpen){
    track.classList.add('running');
    return;
  }

  if(state.cart.length > 8) track.classList.add('idle-scroll');
  else track.classList.remove('idle-scroll');
}



function mountReviewTopBackToScreen(){
  const btn = $('reviewTopBackBtn');
  const screen = $('screen');
  if(!btn || !screen) return;
  if(btn.parentElement !== screen){
    screen.appendChild(btn);
  }
  btn.classList.add('hidden');
}

function beginReviewUnfold(){
  if(!state.cart.length) return;
  const shell = $('screen');
  state.reviewOpen = true;
  renderBitstream({holdStill:true});
  shell.classList.add('review-open','review-opening');

  setTimeout(() => {
    renderReview();
    shell.classList.remove('review-opening');
    $('reviewView').classList.add('arriving');
    setTimeout(() => $('reviewView').classList.remove('arriving'), 620);
  }, 540);
}

function renderReview(){
  $('menuView').classList.add('hidden');
  $('reviewView').classList.remove('hidden');
  $('reviewTopBackBtn')?.classList.remove('hidden');
  renderReviewList();
  renderSummary();
}

function renderReviewList(){
  const list = $('reviewList');
  list.innerHTML = '';
  state.cart.forEach((i, idx) => {
    const row = document.createElement('div');
    row.className = 'review-row';
    row.dataset.index = idx;
    row.innerHTML = `
      <span class="drag-handle">☰</span>
      <span class="bit-tile ${i.type === 'kicker' ? 'amber':'cyan'}">${i.code}</span>
      <img class="thumb" src="${i.image}" alt="">
      <div><div class="row-name">${i.name}${i.escapeRum ? '<span class="tag">ESCAPE RŪM</span>' : ''}</div></div>
      <div>${money(i.price)}</div>
      <button class="remove">×</button>`;
    row.querySelector('.remove').addEventListener('pointerup', e => {
      e.stopPropagation();
      state.cart.splice(idx, 1);
      renderBitstream();
      renderReview();
    });
    attachHoldDrag(row);
    list.appendChild(row);
  });
}

function attachHoldDrag(row){
  let holdTimer = null;
  let ghost = null;
  let startIndex = null;

  row.addEventListener('pointerdown', e => {
    if(e.target.classList.contains('remove')) return;
    startIndex = Number(row.dataset.index);
    try { row.setPointerCapture(e.pointerId); } catch(err) {}
    holdTimer = setTimeout(() => {
      state.isDragging = true;
      row.classList.add('drag-source');
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.textContent = state.cart[startIndex].code + ' · ' + state.cart[startIndex].name;
      ghost.style.left = e.clientX + 12 + 'px';
      ghost.style.top = e.clientY - 24 + 'px';
      document.body.appendChild(ghost);
    }, 320);
  });

  row.addEventListener('pointermove', e => {
    if(!state.isDragging || !ghost) return;
    ghost.style.left = e.clientX + 12 + 'px';
    ghost.style.top = e.clientY - 24 + 'px';
    const rows = [...document.querySelectorAll('.review-row:not(.drag-source)')];
    rows.forEach(r => r.classList.remove('drop-before','drop-after'));
    const target = rows.find(r => {
      const rect = r.getBoundingClientRect();
      return e.clientY >= rect.top && e.clientY <= rect.bottom;
    });
    if(target){
      const rect = target.getBoundingClientRect();
      target.classList.add(e.clientY < rect.top + rect.height / 2 ? 'drop-before' : 'drop-after');
    }
  });

  function finish(e){
    clearTimeout(holdTimer);
    try { row.releasePointerCapture(e.pointerId); } catch(err) {}
    if(!state.isDragging){
      document.querySelectorAll('.review-row').forEach(r => r.classList.remove('drop-before','drop-after'));
      return;
    }
    const rows = [...document.querySelectorAll('.review-row:not(.drag-source)')];
    let targetIndex = state.cart.length - 1;
    let after = true;
    const target = rows.find(r => {
      const rect = r.getBoundingClientRect();
      return e.clientY >= rect.top && e.clientY <= rect.bottom;
    });
    if(target){
      const rect = target.getBoundingClientRect();
      targetIndex = Number(target.dataset.index);
      after = e.clientY >= rect.top + rect.height / 2;
    }
    const [moved] = state.cart.splice(startIndex, 1);
    if(targetIndex > startIndex) targetIndex -= 1;
    const insertAt = Math.max(0, Math.min(state.cart.length, targetIndex + (after ? 1 : 0)));
    state.cart.splice(insertAt, 0, moved);
    state.isDragging = false;
    ghost?.remove();
    document.querySelectorAll('.review-row').forEach(r => r.classList.remove('drag-source','drop-before','drop-after'));
    renderBitstream();
    renderReview();
  }
  row.addEventListener('pointerup', finish);
  row.addEventListener('pointercancel', e => {
    clearTimeout(holdTimer);
    try { row.releasePointerCapture(e.pointerId); } catch(err) {}
    state.isDragging=false;
    ghost?.remove();
    document.querySelectorAll('.review-row').forEach(r => r.classList.remove('drag-source','drop-before','drop-after'));
    renderReview();
  });
}

function renderSummary(){
  const grid = $('summaryGrid');
  grid.innerHTML = '';

  const totalSlots = 64; // 64 bits = 16 Nybbles = 8 Bytes
  let slotIndex = 0;

  for(let row = 0; row < 4; row++){
    const rowEl = document.createElement('div');
    rowEl.className = 'summary-row';

    for(let nibble = 0; nibble < 4; nibble++){
      const nibbleEl = document.createElement('div');
      nibbleEl.className = 'summary-nibble';
      for(let bit = 0; bit < 4; bit++){
        const it = state.cart[slotIndex];
        const c = document.createElement('div');
        c.className = 'summary-cell' + (it?.type === 'kicker' ? ' amber' : '');
        c.textContent = it ? it.code : '';
        nibbleEl.appendChild(c);
        slotIndex++;
      }
      rowEl.appendChild(nibbleEl);

      // Dash separators between Nybbles within a Byte.
      if(nibble === 0 || nibble === 2){
        const dash = document.createElement('div');
        dash.className = 'summary-sep';
        rowEl.appendChild(dash);
      }

      // Larger space between Byte groups.
      if(nibble === 1){
        const gap = document.createElement('div');
        gap.className = 'summary-byte-space';
        rowEl.appendChild(gap);
      }
    }
    grid.appendChild(rowEl);
  }

  $('countLine').innerHTML = `ITEMS IN ORDER: <span>${state.cart.length} BITS</span>`;
  const subtotal = state.cart.reduce((s, i) => s + i.price, 0), tax = subtotal * taxRate, total = subtotal + tax;
  $('subtotal').textContent = money(subtotal);
  $('tax').textContent = money(tax);
  $('total').textContent = money(total);
}

function backToMenu(){
  const shell = $('screen');
  state.reviewOpen = false;
  shell.classList.add('review-closing');
  $('reviewView').classList.add('hidden');
  $('reviewTopBackBtn')?.classList.add('hidden');
  $('menuView').classList.remove('hidden');
  renderMenu();
  renderBitstream({preserveMotion:true});
  shell.classList.remove('review-open','review-opening');
  setTimeout(() => shell.classList.remove('review-closing'), 360);
  clearTimeout(state.idleTimer);
  state.idleTimer = setTimeout(armIdleBitstream, 650);
}

function complete(){
  const t = $('toast');
  t.textContent = 'ORDER PACKET SENT';
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 1800);
}

document.querySelectorAll('.mode-tab').forEach(b => b.addEventListener('pointerup', () => { state.mode = b.dataset.mode; renderMenu(); }));
document.querySelectorAll('.age-btn').forEach(b => b.addEventListener('pointerup', () => { state.age = b.dataset.age; renderMenu(); }));
$('reviewBtn').addEventListener('pointerup', beginReviewUnfold);
$('drawerBackBtn').addEventListener('pointerup', backToMenu);
$('reviewTopBackBtn')?.addEventListener('pointerup', backToMenu);
$('summaryBackBtn')?.addEventListener('pointerup', backToMenu);
$('completeBtn').addEventListener('pointerup', complete);

mountReviewTopBackToScreen();
renderMenu();
renderBitstream();


/* =========================================================
   Review conveyor actual-motion override
   Uses requestAnimationFrame so the review/pay Bitstream visibly moves.
   ========================================================= */
function stopReviewConveyorMotion(){
  if(state.reviewConveyorRAF){
    cancelAnimationFrame(state.reviewConveyorRAF);
    state.reviewConveyorRAF = null;
  }
}

function startReviewConveyorMotion(track, distance){
  stopReviewConveyorMotion();

  const loopDistance = Math.max(320, Number(distance) || 560);
  const speedPxPerSecond = 34;
  let startTime = null;

  function tick(now){
    if(!state.reviewOpen || !track.isConnected){
      stopReviewConveyorMotion();
      return;
    }

    if(startTime === null) startTime = now;
    const elapsedSeconds = (now - startTime) / 1000;
    const x = -((elapsedSeconds * speedPxPerSecond) % loopDistance);
    track.style.setProperty('transform', `translate3d(${x}px,0,0)`, 'important');
    state.reviewConveyorRAF = requestAnimationFrame(tick);
  }

  state.reviewConveyorRAF = requestAnimationFrame(tick);
}

function renderReviewBitstream(){
  const track = $('bitstreamTrack');
  const viewport = $('bitstreamViewport');

  viewport.classList.add('review-conveyor-viewport');
  track.className = 'bitstream-track review-conveyor-track';
  track.innerHTML = '';
  track.style.setProperty('transform', 'translate3d(0,0,0)', 'important');

  const first = buildReviewConveyorCopy();
  const second = buildReviewConveyorCopy();
  second.classList.add('clone');

  track.appendChild(first);
  track.appendChild(second);

  requestAnimationFrame(() => {
    const gap = 12;
    const distance = Math.ceil(first.getBoundingClientRect().width + gap);
    track.style.setProperty('--review-conveyor-distance', distance + 'px');
    track.classList.remove('running');
    // JS drives motion; the class remains for styling/debug only.
    track.classList.add('running');
    startReviewConveyorMotion(track, distance);
  });
}

function renderMenuBitstream(opts={}){
  stopReviewConveyorMotion();

  const track = $('bitstreamTrack');
  const viewport = $('bitstreamViewport');
  viewport.classList.remove('review-conveyor-viewport');
  track.className = 'bitstream-track';
  track.style.removeProperty('transform');

  const wasMoving = track.classList.contains('idle-scroll');
  track.innerHTML = '';

  const byteGroups = chunk(state.cart, 8);
  if(!byteGroups.length) byteGroups.push([]);

  const buildSet = (asClone=false) => {
    byteGroups.forEach((byte, byteIndex) => {
      const byteProgress = Math.min(byte.length / 8, 1);
      const byteWrap = document.createElement('div');
      byteWrap.className = 'byte-wrap' + (byte.length === 8 ? ' locked' : '') + (byte.length ? ' forming' : ' empty-byte') + (asClone ? ' loop-clone' : '');
      byteWrap.style.setProperty('--byte-progress', byteProgress);
      byteWrap.style.setProperty('--byte-trace', Math.round(byteProgress * 100) + '%');

      const byteBody = document.createElement('div');
      byteBody.className = 'byte-body';

      for(let n = 0; n < 2; n++){
        const nybbleItems = byte.slice(n * 4, n * 4 + 4);
        const nybbleProgress = Math.min(nybbleItems.length / 4, 1);
        const nybble = document.createElement('div');
        nybble.className = 'nybble-wrap' + (nybbleItems.length === 4 ? ' locked' : '') + (nybbleItems.length ? ' forming' : ' empty-nybble');
        nybble.style.setProperty('--nybble-progress', nybbleProgress);
        nybble.style.setProperty('--nybble-trace', Math.round(nybbleProgress * 100) + '%');

        const nybbleLabel = document.createElement('div');
        nybbleLabel.className = 'nybble-label';
        nybbleLabel.textContent = 'NYBBLE ' + String(byteIndex * 2 + n + 1).padStart(2,'0');
        nybble.appendChild(nybbleLabel);

        const row = document.createElement('div');
        row.className = 'nybble-row';
        for(let i=0;i<4;i++) row.appendChild(nybbleItems[i] ? bitTile(nybbleItems[i]) : emptySlot());
        nybble.appendChild(row);
        byteBody.appendChild(nybble);
      }
      byteWrap.appendChild(byteBody);
      track.appendChild(byteWrap);
    });
  };

  buildSet(false);
  if(state.cart.length > 8 && !state.reviewOpen) buildSet(true);

  $('reviewBtn').classList.toggle('ready', state.cart.length > 0);

  if(opts.holdStill){
    track.classList.remove('idle-scroll');
    viewport.scrollLeft = 0;
    return;
  }

  if(state.cart.length > 0){
    if(opts.preserveMotion && wasMoving) track.classList.add('idle-scroll');
    else armIdleBitstream();
  } else {
    track.classList.remove('idle-scroll');
    viewport.scrollLeft = 0;
  }
}


/* =========================================================
   Menu bitstream actual-motion fix
   Restores smooth conveyor movement for Payload/Kicker menus only.
   Review/Pay keeps using the dedicated review conveyor.
   ========================================================= */
function stopMenuConveyorMotion(){
  if(state.menuConveyorRAF){
    cancelAnimationFrame(state.menuConveyorRAF);
    state.menuConveyorRAF = null;
  }
}


function createMenuConveyorGap(){
  const gap = document.createElement('div');
  gap.className = 'menu-conveyor-gap';
  return gap;
}

function applyMenuConveyorGap(track, firstCopy){
  const gap = track.querySelector('.menu-conveyor-gap');
  if(!gap) return 0;
  const referenceByte = firstCopy?.querySelector('.byte-wrap');
  const gapWidth = Math.ceil((referenceByte?.getBoundingClientRect().width || 176));
  gap.style.width = gapWidth + 'px';
  return gapWidth;
}

function startMenuConveyorMotion(track, distance){
  stopMenuConveyorMotion();

  const loopDistance = Math.max(260, Number(distance) || 480);
  const speedPxPerSecond = 26;
  let startTime = null;

  function tick(now){
    if(state.reviewOpen || !track.isConnected){
      stopMenuConveyorMotion();
      return;
    }
    if(startTime === null) startTime = now;
    const elapsedSeconds = (now - startTime) / 1000;
    const x = -((elapsedSeconds * speedPxPerSecond) % loopDistance);
    track.style.transform = `translate3d(${x}px,0,0)`;
    state.menuConveyorRAF = requestAnimationFrame(tick);
  }

  state.menuConveyorRAF = requestAnimationFrame(tick);
}

function armIdleBitstream(){
  const vp = $('bitstreamViewport');
  const track = $('bitstreamTrack');
  vp.scrollLeft = 0;

  if(state.reviewOpen){
    stopMenuConveyorMotion();
    track.classList.add('running');
    return;
  }

  if(state.cart.length > 0){
    track.classList.remove('idle-scroll');
    const firstCopy = track.querySelector('.menu-conveyor-copy');
    if(firstCopy){
      const gapWidth = applyMenuConveyorGap(track, firstCopy);
      const distance = Math.ceil(firstCopy.getBoundingClientRect().width + gapWidth);
      startMenuConveyorMotion(track, distance);
    }
  } else {
    stopMenuConveyorMotion();
    track.classList.remove('idle-scroll');
    track.style.removeProperty('transform');
  }
}

function renderMenuBitstream(opts={}){
  stopReviewConveyorMotion();
  stopMenuConveyorMotion();

  const track = $('bitstreamTrack');
  const viewport = $('bitstreamViewport');
  viewport.classList.remove('review-conveyor-viewport');
  track.className = 'bitstream-track';
  track.style.removeProperty('transform');
  track.innerHTML = '';

  const byteGroups = chunk(state.cart, 8);
  if(!byteGroups.length) byteGroups.push([]);

  function buildCopy(asClone=false){
    const copy = document.createElement('div');
    copy.className = 'menu-conveyor-copy' + (asClone ? ' clone' : '');

    byteGroups.forEach((byte, byteIndex) => {
      const byteProgress = Math.min(byte.length / 8, 1);
      const byteWrap = document.createElement('div');
      byteWrap.className = 'byte-wrap' +
        (byte.length === 8 ? ' locked' : '') +
        (byte.length ? ' forming' : ' empty-byte') +
        (asClone ? ' loop-clone' : '');
      byteWrap.style.setProperty('--byte-progress', byteProgress);
      byteWrap.style.setProperty('--byte-trace', Math.round(byteProgress * 100) + '%');

      const byteBody = document.createElement('div');
      byteBody.className = 'byte-body';

      for(let n = 0; n < 2; n++){
        const nybbleItems = byte.slice(n * 4, n * 4 + 4);
        const nybbleProgress = Math.min(nybbleItems.length / 4, 1);
        const nybble = document.createElement('div');
        nybble.className = 'nybble-wrap' +
          (nybbleItems.length === 4 ? ' locked' : '') +
          (nybbleItems.length ? ' forming' : ' empty-nybble');
        nybble.style.setProperty('--nybble-progress', nybbleProgress);
        nybble.style.setProperty('--nybble-trace', Math.round(nybbleProgress * 100) + '%');

        const nybbleLabel = document.createElement('div');
        nybbleLabel.className = 'nybble-label';
        nybbleLabel.textContent = 'NYBBLE ' + String(byteIndex * 2 + n + 1).padStart(2,'0');
        nybble.appendChild(nybbleLabel);

        const row = document.createElement('div');
        row.className = 'nybble-row';
        for(let i = 0; i < 4; i++) row.appendChild(nybbleItems[i] ? bitTile(nybbleItems[i]) : emptySlot());
        nybble.appendChild(row);
        byteBody.appendChild(nybble);
      }

      byteWrap.appendChild(byteBody);
      copy.appendChild(byteWrap);
    });

    return copy;
  }

  const firstCopy = buildCopy(false);
  track.appendChild(firstCopy);

  $('reviewBtn').classList.toggle('ready', state.cart.length > 0);

  if(opts.holdStill){
    track.classList.remove('idle-scroll');
    viewport.scrollLeft = 0;
    return;
  }

  if(state.cart.length > 0){
    const gap = createMenuConveyorGap();
    track.appendChild(gap);
    const secondCopy = buildCopy(true);
    track.appendChild(secondCopy);
    requestAnimationFrame(() => {
      const gapWidth = applyMenuConveyorGap(track, firstCopy);
      const distance = Math.ceil(firstCopy.getBoundingClientRect().width + gapWidth);
      startMenuConveyorMotion(track, distance);
    });
  } else {
    viewport.scrollLeft = 0;
  }
}


/* =========================================================
   Kinetic UI pass
   Touchscreen press feedback, menu transitions, add pulses,
   review row arrivals, and summary update pulses.
   ========================================================= */
(function kineticUiPass(){
  const screen = $('screen');

  function pulseClass(el, className, duration=450){
    if(!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
  }

  function addRipple(el, e){
    if(!el || el.querySelector('.press-ripple[data-live="1"]')) return;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'press-ripple';
    ripple.dataset.live = '1';
    const x = (e?.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e?.clientY ?? rect.top + rect.height / 2) - rect.top;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 620);
  }

  function bindPressFx(el){
    if(!el || el.dataset.pressFxBound === '1') return;
    el.dataset.pressFxBound = '1';
    el.classList.add('ui-press-target');

    el.addEventListener('pointerdown', e => {
      el.classList.add('ui-pressing');
      addRipple(el, e);
    });

    function release(){
      el.classList.remove('ui-pressing');
      pulseClass(el, 'ui-released', 300);
    }

    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', () => el.classList.remove('ui-pressing'));
  }

  function bindAllPressFx(root=document){
    root.querySelectorAll('button,.item-card,.review-row,.age-btn,.mode-tab').forEach(bindPressFx);
  }

  function markRows(){
    document.querySelectorAll('.review-row').forEach((row, idx) => {
      row.style.setProperty('--row-delay', Math.min(idx * 26, 220) + 'ms');
      pulseClass(row, 'row-arrive', 520);
    });
  }

  function pulseSummary(){
    pulseClass(document.querySelector('.summary-panel'), 'summary-updating', 520);
  }

  function pulseBitstream(){
    pulseClass($('bitstreamDrawer'), 'kinetic-pulse', 740);
  }

  // Wrap functions that are called through existing anonymous handlers.
  const originalRenderMenu = renderMenu;
  renderMenu = function(...args){
    screen.classList.remove('menu-switching');
    void screen.offsetWidth;
    screen.classList.add('menu-switching');
    const result = originalRenderMenu.apply(this, args);
    bindAllPressFx();
    setTimeout(() => screen.classList.remove('menu-switching'), 520);
    return result;
  };

  const originalAddItem = addItem;
  addItem = function(item, sourceEl){
    pulseClass(sourceEl, 'added', 620);

    const plusEl = sourceEl?.querySelector?.('.plus') || (sourceEl?.classList?.contains('plus') ? sourceEl : null);
    if(plusEl){
      plusEl.classList.remove('ui-pressing','ui-released','plus-spin');
      void plusEl.offsetWidth;
      plusEl.classList.add('plus-spin');
      setTimeout(() => plusEl.classList.remove('plus-spin'), 560);
    }

    pulseBitstream();
    const result = originalAddItem.apply(this, arguments);
    setTimeout(() => {
      const tiles = [...document.querySelectorAll('.bit-tile,.review-conveyor-bit,.summary-cell')];
      const lastMatch = tiles.reverse().find(t => t.textContent === item.code);
      pulseClass(lastMatch, 'just-added', 620);
    }, 60);
    return result;
  };

  const originalRenderReview = renderReview;
  renderReview = function(...args){
    const result = originalRenderReview.apply(this, args);
    bindAllPressFx($('reviewView'));
    markRows();
    return result;
  };

  const originalRenderSummary = renderSummary;
  renderSummary = function(...args){
    const result = originalRenderSummary.apply(this, args);
    pulseSummary();
    return result;
  };

  // Existing direct function listeners were already attached earlier, so add visual-only listeners too.
  $('reviewBtn')?.addEventListener('pointerup', () => {
    pulseClass(screen, 'review-opening', 650);
    pulseBitstream();
  });

  $('completeBtn')?.addEventListener('pointerup', () => {
    pulseClass($('completeBtn'), 'sending', 780);
    pulseSummary();
  });

  $('drawerBackBtn')?.addEventListener('pointerup', () => pulseBitstream());
  $('reviewTopBackBtn')?.addEventListener('pointerup', () => pulseBitstream());
  $('summaryBackBtn')?.addEventListener('pointerup', () => pulseBitstream());

  // Watch for dynamically-rendered cards/rows/buttons.
  const observer = new MutationObserver(mutations => {
    for(const m of mutations){
      m.addedNodes.forEach(node => {
        if(node.nodeType === 1) bindAllPressFx(node);
      });
    }
  });
  observer.observe(document.body, {childList:true, subtree:true});

  bindAllPressFx();
})();


/* Kinetic layout guard */
document.querySelectorAll('.review-list-panel,.summary-panel,.category-mount,.grid,.bitstream-drawer').forEach(el => {
  el.classList.remove('ui-press-target','ui-pressing','ui-released');
});


/* Direct plus icon spin trigger */
document.addEventListener('pointerup', e => {
  const plus = e.target.closest?.('.plus');
  if(!plus) return;

  plus.classList.remove('plus-spin');
  void plus.offsetWidth;
  plus.classList.add('plus-spin');
  setTimeout(() => plus.classList.remove('plus-spin'), 620);
}, true);
