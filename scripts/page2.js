(() => {
  const page2 = document.getElementById("page2");
  const content2 = document.createElement("div");
  content2.className = "content2";

  const view = document.createElement("div");

  view.innerHTML = `
  <h3>制作物一覧</h3>
<button id="opengame1" style="display:inline;">B100風ゲーム</button><div style="display:inline;">……既存のゲームシステムを記憶から再現　使用言語:javascript</div>
<br>
<button onclick="location.href='reversi.html'" style="display:inline;">1人用オセロ</button><div style="display:inline;">……AWSの練習がてら作成　使用言語:javascript</div>

`;

  content2.appendChild(view);
  page2.appendChild(content2);

  const og1 = document.getElementById("opengame1");
  og1.addEventListener('click',() => {opengame1()});

  function opengame1() {
    document.querySelector(".content2_1").style.display = "block";
    document.querySelector(".content2").style.display = "none";
  }

})();
