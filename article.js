import { showToast } from "./ui.js";
import { getArticles, updateArticle, getArticleById } from "./storage.js";

/**
 * Hämtar artikelns ID från webbläsarens URL
 * @returns {String|null} ID strängen frpån URL eller null om den saknas
 */
function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/**
 * Hämtar artikeldata och skapar HTML-strukturen för att visa artikel på sidan
 * Hanterar även felmeddelande om artikel inte hittas.
 * @returns {void}
 */
function renderArticle() {
  const id = getArticleId();
  const article = getArticleById(id);
  const el = document.getElementById("article-content");
  el.innerHTML = "";

  if (!article) {
    el.innerHTML = `<div class="text-center py-5">
      <i class="bi bi-exclamation-circle fs-1 text-muted d-block mb-3"></i>
      <h3>Artikeln hittades inte</h3>
      <p class="text-muted">Artikeln kan ha blivit raderad.</p>
      <a href="index.html" class="btn btn-new-article mt-2">Tillbaka</a>
    </div>`;
    document.getElementById("reaction-bar").style.display = "none";
    document.querySelector(".comments-section").style.display = "none";
    return;
  }

  document.title = `${article.title} – Herman News`;

  const badge = document.createElement("span");
  badge.className = "badge card-category mb-3";
  badge.textContent = article.category;

  const title = document.createElement("h1");
  title.className = "article-full-title";
  title.textContent = article.title;

  const meta = document.createElement("p");
  meta.className = "card-meta mb-4";
  meta.append(
    Object.assign(document.createElement('i'), {className: 'bi bi-person me-1'}),
    Object.assign(document.createElement('strong'), {textContent: article.author}),
    " · ",
    Object.assign(document.createElement('i'), {className: 'bi bi-clock me-1'}),
    article.date
  );

  const content = document.createElement("div");
  content.className = "article-full-content";
  content.textContent = article.content;
  content.style.whiteSpace = "pre-line";

  el.append(badge, title, meta, content);
  renderReactions(article);
  renderComments(article);
}

/**
 * Hanterar lokigen för att gillar eller ogilla en artikel
 * Sparar likes/dislikes i localStorage för att man ej ska kunna "rösta" mer än 1 gång
 * @param {String} type - typen av "reaktion" antingen "like" eller "dislike".
 * @returns {void}
 */
function toggleReaction(type) {
  const id = getArticleId();
  const article = getArticleById(id);
  if (!article) return;

  const prevVote = localStorage.getItem(`vote_${id}`);
  if (prevVote === type) {
    article[type === "like" ? "likes" : "dislikes"]--;
    localStorage.removeItem(`vote_${id}`);
  } else {
    if (prevVote) article[prevVote === "like" ? "likes" : "dislikes"]--;
    article[type === "like" ? "likes" : "dislikes"]++;
    localStorage.setItem(`vote_${id}`, type);
  }
  
  updateArticle(article);
  renderReactions(article);
}

/**
 * Uppdaterar gränsnittet (DOM) med det aktuella antalet likes och dislikes.
 * @param {Object} article artikelobjektet som innehållet reeaktionsdatan.
 * @returns {void}
 */
function renderReactions(article) {
  document.getElementById("like-count").textContent = article.likes || 0;
  document.getElementById("dislike-count").textContent = article.dislikes || 0;
  
  const userVote = localStorage.getItem(`vote_${article.id}`);
  document.getElementById("like-btn").classList.toggle("active", userVote === "like");
  document.getElementById("dislike-btn").classList.toggle("active", userVote === "dislike");
}

function renderComments(article) {
  const list = document.getElementById("comments-list");
  const count = document.getElementById("comments-count");
  const comments = article.comments || [];
  
  count.textContent = comments.length;
  list.innerHTML = "";

  if (comments.length === 0) {
    list.innerHTML = '<p class="text-muted fst-italic">Inga kommentarer ännu.</p>';
    return;
  }

  comments.forEach((c, i) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    
    const header = document.createElement("div");
    header.className = "comment-header d-flex align-items-center gap-2";
    header.innerHTML = '<i class="bi bi-person-circle comment-avatar"></i>';
    
    const author = Object.assign(document.createElement("strong"), {textContent: c.author});
    const date = Object.assign(document.createElement("span"), {className: "comment-date", textContent: c.date});
    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete-comment ms-auto";
    delBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    delBtn.onclick = () => deleteComment(i);

    header.append(author, date, delBtn);
    const text = Object.assign(document.createElement("p"), {
      className: "comment-text", 
      textContent: c.text,
      style: "white-space: pre-line"
    });

    item.append(header, text);
    list.appendChild(item);
  });
}

/**
 * Validerar och lägger till en ny komnmentar till den akutella artikeln.
 * Uppdaterar därefter localStorage
 * @returns  {void}
 */
function addComment() {
  const id = getArticleId();
  const article = getArticleById(id);
  const authorInput = document.getElementById("comment-author");
  const textInput = document.getElementById("comment-text");
  const text = textInput.value.trim();

  if (!text) return showToast("Kommentaren är tom.", "warning");

  const comment = {
    author: authorInput.value.trim() || "Anonym",
    text,
    date: new Date().toLocaleString("sv-SE", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  article.comments = article.comments || [];
  article.comments.push(comment);
  updateArticle(article);
  
  authorInput.value = "";
  textInput.value = "";
  renderComments(article);
  showToast("Kommentar tillagd!", "success");
}

/**
 * Tar bort en specifik kommentar baserar på dess index
 * Krävern en bekräftelse från användaren innan radering.
 * @param {number} index Position för kommentaren i artikelns kommentars array
 * @returns {void}
 */
function deleteComment(index) {
  const id = getArticleId();
  const article = getArticleById(id);
  if (!article || !confirm("Radera kommentar?")) return;

  article.comments.splice(index, 1);
  updateArticle(article);
  renderComments(article);
}

window.toggleReaction = toggleReaction;
window.addComment = addComment;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("article-content")) renderArticle();
});