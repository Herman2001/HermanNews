const STORAGE_KEY = "herman_articles";

/**
 * Hämtar alla artiklar från localStorage
 */
export function getArticles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

/**
 * Sparar hela arrayen med artiklar till localStorage
 */
export function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

/**
 * Hämtar en specifik artikel baserat på ID
 */
export function getArticleById(id) {
  return getArticles().find((a) => a.id === id) || null;
}

/**
 * Uppdaterar en befintlig artikel eller lägger till en ny om ID saknas
 */
export function updateArticle(updatedArticle) {
  const articles = getArticles();
  const index = articles.findIndex((a) => a.id === updatedArticle.id);

  if (index !== -1) {
    articles[index] = updatedArticle;
  } else {
    articles.unshift(updatedArticle);
  }

  saveArticles(articles);
}
