const resultContainer = document.getElementById('results');

// Lambda関数のURL（CORS許可しておくこと！）
const API_URL = 'https://edbfqdrd3dge5t76s7jg2xwxmm0pzmqu.lambda-url.ap-northeast-1.on.aws/';

fetch(API_URL, {
  method: "GET",
  mode: "cors",
  credentials: "omit", // Cookieや認証情報を送らないようにする
  headers: {
    "Content-Type": "application/json"
  }
})
  .then(response => response.json())
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) {
      resultContainer.textContent = 'データがありません。';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <tr><th>日時</th><th>勝者</th><th>黒</th><th>白</th></tr>
    `;
    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(item.timestamp).toLocaleString()}</td>
        <td>${item.winner}</td>
        <td>${item.blackCount}</td>
        <td>${item.whiteCount}</td>
      `;
      table.appendChild(tr);
    });

    resultContainer.innerHTML = '';
    resultContainer.appendChild(table);
  })
  .catch(err => {
    console.error('取得失敗:', err);
    resultContainer.textContent = '結果の取得に失敗しました。';
  });
