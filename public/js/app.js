const q = document.getElementById('q');
const results = document.getElementById('results');

if (q && results) {
  let t;
  q.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const term = q.value.trim();
      results.innerHTML = '';
      if (!term) return;
      const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await r.json();
      data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.title}</strong> — ${item.area_name}`;
        results.appendChild(li);
      });
    }, 250);
  });
}
