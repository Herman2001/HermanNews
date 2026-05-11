import { showToast } from "./ui.js";
import { getArticles, saveArticles, updateArticle } from "./storage.js";

/**
 * Rensar formulärfälten och visar modalen för att skapa en ny artikel
 * @returns {void}
 */
function openModal() {
  document.getElementById('articleTitle').value = '';
  document.getElementById('articleContent').value = '';
  document.getElementById('articleAuthor').value = '';
  document.getElementById('articleCategory').value = 'Sverige';
  document.getElementById('modalError').classList.add('d-none');
  const modal = new bootstrap.Modal(document.getElementById('articleModal'));
  modal.show();
}

/**
 * Hämtar data från modalen formulär, validerar och skapar ett nytt artikel-objekt.
 * Sparar artikeln vis storage modulen och uppdaterar gränssnittet.
 * @returns {void}
 */
function saveArticle() {
  const title    = document.getElementById('articleTitle').value.trim();
  const content  = document.getElementById('articleContent').value.trim();
  const author   = document.getElementById('articleAuthor').value.trim();
  const category = document.getElementById('articleCategory').value;
  const errorEl  = document.getElementById('modalError');

  if (!title || !content) {
    errorEl.textContent = 'Rubrik och innehåll är obligatoriska fält.';
    errorEl.classList.remove('d-none');
    return;
  }

  const article = {
    id:       Date.now().toString(),
    title,
    content,
    author:   author || 'Redaktionen',
    category,
    date:     new Date().toLocaleString('sv-SE', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    likes:    0,
    dislikes: 0,
    comments: []
  };

  updateArticle(article);

  bootstrap.Modal.getInstance(document.getElementById('articleModal')).hide();
  renderArticles();
  showToast(`Artikeln "${title}" har publicerats!`, 'success');
}

/**
 * Tar bort en artikel baserat på dess ID efter bekräftelse från användaren.
 * @param {String} id Id för artikeln som ska raderas
 * @returns {void}
 */
function deleteArticle(id) {
  const articles = getArticles();
  const article  = articles.find(a => a.id === id);
  if (!article || !confirm(`Vill du verkligen radera "${article.title}"?`)) return;

  const updated = articles.filter(a => a.id !== id);
  saveArticles(updated);
  renderArticles();
  showToast(`Artikeln "${article.title}" har raderats.`, 'danger');
}

/**
 * Hämtar alla artiklar och ritar upp dem i DOM:en.
 * Om inga artiklar finns visas ett meddelande om att listan är tom.
 * @returns {void}
 */
function renderArticles() {
  const container = document.getElementById('user-articles-container');
  const articles = getArticles();

  container.innerHTML = '';

  if (articles.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center py-4">
        <i class="bi bi-newspaper fs-2 d-block mb-2 text-muted"></i>
        <p class="text-muted fst-italic">Inga användarskapade artiklar ännu.<br>Tryck på "Ny artikel" för att lägga till!</p>
      </div>`;
    return;
  }

  articles.forEach(article => {
    const excerpt = article.content.length > 60 ? article.content.slice(0, 60) + '…' : article.content;

    const card = document.createElement('article');
    card.className = 'card card-main card-user border-0 rounded-0 bg-transparent';
    
    const body = document.createElement('div');
    body.className = 'card-body px-0 pb-0';

    
    const topRow = document.createElement('div');
    topRow.className = 'd-flex justify-content-between align-items-start mb-1';
    const badge = document.createElement('span');
    badge.className = 'badge card-category';
    badge.textContent = article.category;
    const btn = document.createElement('button');
    btn.className = 'btn btn-delete-article';
    btn.innerHTML = '<i class="bi bi-trash"></i>';
    btn.onclick = () => deleteArticle(article.id);
    topRow.append(badge, btn);

    
    const h3 = document.createElement('h3');
    h3.className = 'card-title card-title-list';
    const link = document.createElement('a');
    link.href = `article.html?id=${article.id}`;
    link.textContent = article.title;
    h3.appendChild(link);

    
    const p1 = document.createElement('p');
    p1.className = 'card-text card-excerpt';
    p1.textContent = excerpt;

    const p2 = document.createElement('p');
    p2.className = 'card-text card-meta';
    
    p2.append(
      Object.assign(document.createElement('i'), {className: 'bi bi-person me-1'}),
      `${article.author} · `,
      Object.assign(document.createElement('i'), {className: 'bi bi-clock me-1'}),
      `${article.date} · `,
      Object.assign(document.createElement('i'), {className: 'bi bi-chat-dots me-1'}),
      `${article.comments?.length || 0} kommentarer`
    );

    body.append(topRow, h3, p1, p2);
    card.appendChild(body);
    container.appendChild(card);
  });
}

window.openModal = openModal;
window.saveArticle = saveArticle;
window.deleteArticle = deleteArticle;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('user-articles-container')) renderArticles();
});