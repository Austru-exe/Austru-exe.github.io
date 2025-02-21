import { articles } from './articles.js'; // articles.jsからデータをインポート

document.addEventListener("DOMContentLoaded", () => {
  const page1 = document.getElementById("page1");

  // content1 内部に contentArea と sidebar を生成
  const content1 = document.createElement("div");
  content1.className = "content1";

  const contentArea = document.createElement("div");
  contentArea.id = "content-area";

  const sidebar = document.createElement("div");
  sidebar.id = "sidebar";
  sidebar.innerHTML = `
    <input type="text" id="searchInput" placeholder="タイトルまたは記事を検索">
    <select id="sortSelect">
      <option value="newest">新しい順</option>
      <option value="oldest">古い順</option>
    </select>
    <div id="dateFilter">
      <label for="dateSelect">期間:</label>
      <select id="dateSelect">
        <!-- 期間オプションはここに追加されます -->
      </select>
    </div>
  `;

  content1.appendChild(contentArea);
  content1.appendChild(sidebar);
  page1.appendChild(content1);

  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const dateSelect = document.getElementById("dateSelect");

  // 記事の年月を取得し、セレクトボックスのオプションを生成
  const uniqueDates = [...new Set(articles.map(article => {
    const date = new Date(article.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }))];

  // 「全期間」オプションを最初に追加
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "全期間";
  dateSelect.appendChild(allOption);

  // 残りの年月オプションを追加
  uniqueDates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = `${date} (${getArticleCount(date)})`;  // 年月の後ろに一致する記事数を表示
    dateSelect.appendChild(option);
  });

  let currentPage = 1; // 現在のページ
  const articlesPerPage = 10; // 1ページに表示する記事数

  // 初期表示（全期間）
  filterAndDisplayArticles(); 

  // 検索バーで単語を検索するイベントリスナー
  searchInput.addEventListener("input", () => {
    filterAndDisplayArticles();  // 検索語と期間選択を反映させてフィルタリング
    updateDateSelect();  // 検索語に一致する記事数を更新
    hideEmptyDateOptions();  // 一致する記事がない期間オプションを非表示
  });

  // ソート順変更のイベントリスナー
  sortSelect.addEventListener("change", () => {
    filterAndDisplayArticles();  // ソート後、表示
  });

  // 期間選択（年月）変更のイベントリスナー
  dateSelect.addEventListener("change", () => {
    filterAndDisplayArticles();  // 期間変更後、表示
  });

  // 記事数を取得する関数（期間フィルターを適用せずに、検索語一致の記事数をカウント）
  function getArticleCount(date) {
    const searchTerm = searchInput.value.toLowerCase();

    return articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(searchTerm);
      const contentMatch = article.content.toLowerCase().includes(searchTerm);

      const articleDate = new Date(article.date);
      const yearMonth = `${articleDate.getFullYear()}/${String(articleDate.getMonth() + 1).padStart(2, '0')}`;
      
      // 期間フィルターは適用せず、検索語に一致する記事数をカウント
      return (titleMatch || contentMatch) && (date === "all" || yearMonth === date);
    }).length;
  }

  // 検索と期間選択を反映した記事のフィルタリングと表示
  function filterAndDisplayArticles() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDate = dateSelect.value;

    // 記事のフィルタリング
    let filteredArticles = articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(searchTerm);
      const contentMatch = article.content.toLowerCase().includes(searchTerm);
      return titleMatch || contentMatch;  // タイトルまたは記事内容が一致する記事
    });

    // 期間フィルター
    if (selectedDate !== "all") {
      filteredArticles = filteredArticles.filter(article => {
        const date = new Date(article.date);
        const yearMonth = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        return yearMonth === selectedDate;
      });
    }

    // ソート順（新しい順・古い順）
    const sortValue = sortSelect.value;
    if (sortValue === "newest") {
      filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date)); // 新しい順
    } else if (sortValue === "oldest") {
      filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date)); // 古い順
    }

    // ページネーションに基づいて表示する記事を切り替え
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const pagedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

    // フィルタリングされた記事を表示
    displayArticlesFromList(pagedArticles);

    // ページネーションの表示
    displayPagination(totalPages);
  }

  // 記事を表示する関数
  function displayArticlesFromList(articleList) {
    const articleContainer = document.createElement("div");
    articleContainer.innerHTML = "";

    for (let article of articleList) {
      const articleDiv = document.createElement("div");
      articleDiv.className = "blog-content";
      articleDiv.innerHTML = `
        <h3>${article.title}</h3>
        <pre>${article.content}</pre>
        <small>投稿日: ${article.date}</small>
      `;
      articleContainer.appendChild(articleDiv);
    }

    const contentArea = document.getElementById("content-area");
    contentArea.innerHTML = "";
    contentArea.appendChild(articleContainer);
  }

 // ページネーションを表示する関数
function displayPagination(totalPages) {
  const paginationContainer = document.createElement("div");
  paginationContainer.className = "pagination";

  // ページ番号の最大数（省略する前の最大数）
  const maxPagesToShow = 5;
  const halfMaxPages = Math.floor(maxPagesToShow / 2);

  // 最初のページボタン（<<）
  const firstPageLink = document.createElement("a");
  firstPageLink.href = "#";
  firstPageLink.textContent = "<<";
  firstPageLink.className = "pagination-btn";
  firstPageLink.addEventListener("click", (e) => {
    e.preventDefault();
    currentPage = 1;
    filterAndDisplayArticles();
  });
  paginationContainer.appendChild(firstPageLink);

  // ページ番号を表示
  const pageButtons = [];
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= maxPagesToShow || (i >= currentPage - halfMaxPages && i <= currentPage + halfMaxPages)) {
      const pageButton = document.createElement("a");
      pageButton.href = "#";
      pageButton.textContent = i;
      pageButton.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
      pageButton.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        filterAndDisplayArticles();
      });
      pageButtons.push(pageButton);
    }
  }

  // "..."を表示するための処理
  if (totalPages > maxPagesToShow) {
    if (currentPage - halfMaxPages > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      paginationContainer.appendChild(ellipsis);
    }

    pageButtons.forEach(pageButton => paginationContainer.appendChild(pageButton));

    if (currentPage + halfMaxPages < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      paginationContainer.appendChild(ellipsis);
    }
  } else {
    pageButtons.forEach(pageButton => paginationContainer.appendChild(pageButton));
  }

  // 最後のページボタン（>>）
  const lastPageLink = document.createElement("a");
  lastPageLink.href = "#";
  lastPageLink.textContent = ">>";
  lastPageLink.className = "pagination-btn";
  lastPageLink.addEventListener("click", (e) => {
    e.preventDefault();
    currentPage = totalPages;
    filterAndDisplayArticles();
  });
  paginationContainer.appendChild(lastPageLink);

  // ページネーションを表示
  const contentArea = document.getElementById("content-area");
  contentArea.appendChild(paginationContainer);
}

});
