const caseData = CaseData;
const caseParams = new URLSearchParams(location.search);
const requestedId = caseParams.get('id');
caseParams.delete('id');
const galleryURL = `./index.html${caseParams.size ? `?${caseParams}` : ''}`;

function renderError(id) {
  document.getElementById('cs-container').innerHTML = `<div class="cs-card"><div class="cs-eyebrow">${caseData.escape(id || 'Case Study')}</div><h1 class="cs-name">Case study temporarily unavailable</h1><p>Please try again later, or explore another case study.</p></div><div class="cs-nav"><a href="${caseData.escape(galleryURL)}">Gallery</a><a href="${caseData.escape(location.pathname + location.search)}">Try again</a></div>`;
}

async function boot() {
  try {
    const studies = await caseData.loadAll();
    const study = studies.find(value => value.id === requestedId);
    if (!study || study.unavailable) { renderError(requestedId); return; }
    let matching = studies.filter(value => !value.unavailable && caseData.matches(value, caseParams));
    if (!matching.some(value => value.id === requestedId)) matching = studies.filter(value => !value.unavailable);
    const index = matching.findIndex(value => value.id === requestedId);
    const navigation = matching.length > 1
      ? `<a href="${caseData.escape(caseData.link(matching[(index - 1 + matching.length) % matching.length].id, caseParams))}">&larr; Prev</a><a href="${caseData.escape(galleryURL)}">Gallery</a><a href="${caseData.escape(caseData.link(matching[(index + 1) % matching.length].id, caseParams))}">Next &rarr;</a>`
      : `<a href="${caseData.escape(galleryURL)}">Gallery</a>`;
    const tags = [...new Set(caseData.categories.flatMap(key => study[key]))];
    document.title = `${study.name} · ChangeIS Case Study`;
    document.getElementById('cs-container').innerHTML = `<div class="cs-card"><div class="cs-header"><div class="cs-eyebrow">Case Study</div><h1 class="cs-name">${caseData.escape(study.name)}</h1><div class="cs-tagline">${caseData.escape(study.tagline)}</div><div class="cs-meta">${tags.map(tag => `<span class="cs-meta-tag">${caseData.escape(tag)}</span>`).join('')}</div></div><table>${caseData.sections.map((key, i) => `<tr><th scope="row"><span class="starry-letter">${caseData.labels[i][0]}</span>${caseData.labels[i].slice(1)}</th><td>${study.starry[key]}</td></tr>`).join('')}</table></div><div class="cs-nav">${navigation}</div>`;
  } catch (error) {
    console.error('Could not display case study', error);
    renderError(requestedId);
  }
}

boot();
