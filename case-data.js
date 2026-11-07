/* Individual case files are the source of truth. No combined JSON is needed. */
window.CaseData = (() => {
  const categories = ['location', 'industry', 'discipline'];
  const sections = ['situation', 'task', 'action', 'result', 'reflection', 'yield'];
  const labels = ['Situation', 'Tasks', 'Actions', 'Results', 'Reflection', 'Yield'];
  const validId = id => typeof id === 'string' && /^CS\d{2,}$/.test(id);
  const escape = value => String(value).replace(/[&<>"']/g, character =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

  async function readJSON(path) {
    const response = await fetch(path, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  function validateCase(value, id) {
    if (!value || value.id !== id) throw new Error(`${id}: file ID does not match manifest`);
    for (const key of ['name', 'tagline']) {
      if (typeof value[key] !== 'string' || !value[key].trim()) throw new Error(`${id}: missing ${key}`);
    }
    for (const key of categories) {
      if (!Array.isArray(value[key]) || !value[key].every(tag => typeof tag === 'string' && tag.trim())) {
        throw new Error(`${id}: invalid ${key} tags`);
      }
    }
    for (const key of sections) {
      if (typeof value.starry?.[key] !== 'string' || !value.starry[key].trim()) {
        throw new Error(`${id}: missing ${key}`);
      }
    }
    return value;
  }

  async function loadAll() {
    const ids = await readJSON('./manifest.json');
    if (!Array.isArray(ids) || !ids.every(validId) || new Set(ids).size !== ids.length) {
      throw new Error('Manifest must contain unique case IDs such as CS01');
    }
    const results = await Promise.allSettled(ids.map(async id => {
      const path = `./casestudies/${id}.json`;
      return {...validateCase(await readJSON(path), id), path};
    }));
    return results.map((result, index) => {
      if (result.status === 'fulfilled') return result.value;
      console.error(`Could not load ${ids[index]}`, result.reason);
      return {id: ids[index], path: `./casestudies/${ids[index]}.json`, unavailable: true};
    });
  }

  function matches(study, params) {
    if (study.unavailable) return !categories.some(key => params.getAll(key).length);
    return categories.every(key => {
      const selected = params.getAll(key);
      return selected.length === 0 || selected.some(tag => study[key].includes(tag));
    });
  }

  function link(id, params) {
    const query = new URLSearchParams(params);
    query.set('id', id);
    return `./CStemplate.html?${query}`;
  }

  return {categories, sections, labels, escape, loadAll, matches, link};
})();
