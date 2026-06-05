/**
 * Fix admin/CMS HTML where block content is wrongly wrapped in <h1 style="...">.
 * Keeps real h2/h3 headings; body copy renders as normal prose.
 */
export function normalizeCmsProseHtml(html) {
  if (!html || typeof html !== 'string') return html;

  if (typeof DOMParser === 'undefined') {
    return html
      .replace(/<h1[^>]*>\s*<p>/gi, '<div class="info-prose-block"><p>')
      .replace(/<\/h1>(\s*(?=<h2|<h3|<\/div>))/gi, '</div>$1');
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.body;

  const firstH1 = root.querySelector(':scope > h1:first-child');
  if (firstH1 && !firstH1.querySelector('p, ul, ol') && firstH1.textContent.trim().length < 120) {
    firstH1.remove();
  }

  root.querySelectorAll('h1').forEach((h1) => {
    if (h1.querySelector('p, ul, ol, li')) {
      const block = doc.createElement('div');
      block.className = 'info-prose-block';
      while (h1.firstChild) {
        block.appendChild(h1.firstChild);
      }
      h1.replaceWith(block);
    } else {
      h1.removeAttribute('style');
    }
  });

  root.querySelectorAll('[style]').forEach((el) => {
    el.removeAttribute('style');
  });

  root.querySelectorAll('p').forEach((p) => {
    const parent = p.parentElement;
    if (parent?.tagName === 'P') {
      const frag = doc.createDocumentFragment();
      while (p.firstChild) frag.appendChild(p.firstChild);
      p.replaceWith(frag);
    }
  });

  return root.innerHTML.trim();
}
