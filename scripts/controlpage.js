(() => {
  const numPages = 4; // 任意のページ数を設定
  const pages = {};
  const pageContainer = document.getElementById("pageContainer");

  // ページの生成
  for (let i = 0; i < numPages; i++) {
    const pageId = `page${i}`;
    const pageDiv = document.createElement("div");
    pageDiv.id = pageId;
    pageDiv.className = "page";
    pageDiv.style.display = i === 0 ? "block" : "none"; // 初期ページの表示設定

    // ページ遷移用のボタンを生成
    const buttonDiv = document.createElement("div");
    buttonDiv.className = "bottom-buttons";
    // ボタンラベルとクラス名を設定する配列
    const pageNames = [
      { label: "ホーム", className: "Page0" },
      { label: "ブログ", className: "Page1" },
      { label: "ゲーム", className: "Page2" },
      { label: "リンク", className: "Page3" },
    ];

    // 必要に応じてページ名の配列を拡張
    for (let j = 0; j < numPages; j++) {
      const button = document.createElement("button");

      // jが名前付きならそれを使用、それ以外は「Page j」
      if (pageNames[j]) {
        button.textContent = pageNames[j].label;
        button.className = pageNames[j].className;
      } else {
        button.textContent = `Page ${j}`;
        button.className = `openPage${j}`;
      }

      // クリックイベント
      button.addEventListener("click", () => showPage(`page${j}`));
      buttonDiv.appendChild(button);
    }

    pageDiv.appendChild(buttonDiv);
    pageContainer.appendChild(pageDiv);
    pages[pageId] = pageDiv;
  }

  function showPage(pageId) {
    Object.keys(pages).forEach((id) => {
      pages[id].style.display = id === pageId ? "block" : "none";
    });
  }

  // 初期ページの表示
  showPage("page0");

})();
