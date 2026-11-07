const galleryData = CaseData;
const galleryParams = new URLSearchParams(location.search);
galleryParams.delete('id');
const PAGE_SIZE = 3;
let allCases = [];
let filtered = [];
let page = Math.max(0, Number.parseInt(galleryParams.get('page'), 10) || 0);

function retryMessage(message) {
  const grid = document.getElementById('carouselTrack');
  grid.innerHTML = `<div class="no-results" style="display:block"><p>${message}</p><button class="clear-btn" id="retryBtn">Try again</button></div>`;
  document.getElementById('retryBtn').addEventListener('click', () => location.reload());
  document.getElementById('page-info').textContent = '';
  document.getElementById('btn-prev').disabled = true;
  document.getElementById('btn-next').disabled = true;
}

async function boot() {
  try {
    allCases = await galleryData.loadAll();
    buildFilters();
    applyFilters();
  } catch (error) {
    console.error('Could not load case studies', error);
    retryMessage('Case studies are temporarily unavailable. Please try again.');
  }
}

function buildFilters() {
  for (const key of galleryData.categories) {
    const tags = [...new Set(allCases.filter(study => !study.unavailable).flatMap(study => study[key]))].sort();
    const container = document.getElementById(`chips-${key}`);
    container.replaceChildren();
    for (const tag of tags) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = tag;
      button.setAttribute('aria-pressed', String(galleryParams.getAll(key).includes(tag)));
      button.addEventListener('click', () => {
        const selected = new Set(galleryParams.getAll(key));
        if (selected.has(tag)) selected.delete(tag); else selected.add(tag);
        galleryParams.delete(key);
        for (const value of selected) galleryParams.append(key, value);
        page = 0;
        buildFilters();
        applyFilters();
      });
      container.appendChild(button);
    }
  }
}

function applyFilters() {
  filtered = allCases.filter(study => galleryData.matches(study, galleryParams));
  page = Math.min(page, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  galleryParams.set('page', String(page));
  history.replaceState(null, '', `${location.pathname}?${galleryParams}`);
  renderPage();
}

function clearFilters() {
  for (const key of galleryData.categories) galleryParams.delete(key);
  page = 0;
  buildFilters();
  applyFilters();
}

function renderPage() {
  const grid = document.getElementById('carouselTrack');
  grid.replaceChildren();
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results" style="display:block"><p>${allCases.length ? 'No matching case studies.' : 'No case studies are available yet.'}</p><button class="clear-btn" id="emptyClear">Clear filters</button></div>`;
    document.getElementById('emptyClear').addEventListener('click', clearFilters);
  }
  for (const study of filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)) {
    const card = document.createElement(study.unavailable ? 'article' : 'a');
    card.className = 'tile';
    if (study.unavailable) {
      card.setAttribute('aria-label', `${study.id}: case study temporarily unavailable`);
      card.style.cursor = 'default';
      card.innerHTML = `<div class="tile-eyebrow">${galleryData.escape(study.id)}</div><div class="tile-name">Case study temporarily unavailable</div><div class="tile-tagline">Please try again later.</div>`;
    } else {
      card.href = galleryData.link(study.id, galleryParams);
      const tags = [...new Set(galleryData.categories.flatMap(key => study[key]))];
      card.innerHTML = `<div class="tile-eyebrow">Case Study</div><div class="tile-name">${galleryData.escape(study.name)}</div><div class="tile-tagline">${galleryData.escape(study.tagline)}</div><div class="tile-tags">${tags.map(tag => `<span class="tile-tag">${galleryData.escape(tag)}</span>`).join('')}</div>`;
    }
    grid.appendChild(card);
  }
  const start = filtered.length ? page * PAGE_SIZE + 1 : 0;
  const end = Math.min((page + 1) * PAGE_SIZE, filtered.length);
  document.getElementById('page-info').textContent = `${start}–${end} of ${filtered.length}`;
  document.getElementById('btn-prev').disabled = page === 0;
  document.getElementById('btn-next').disabled = (page + 1) * PAGE_SIZE >= filtered.length;
}

document.getElementById('btn-prev').addEventListener('click', () => { page--; applyFilters(); });
document.getElementById('btn-next').addEventListener('click', () => { page++; applyFilters(); });
document.getElementById('clearBtn').addEventListener('click', clearFilters);
boot();
