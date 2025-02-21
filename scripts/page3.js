(() => {
  const page3 = document.getElementById("page3");

  const content3 = document.createElement("div");
  content3.className = "content3";

  const view = document.createElement("div");

  view.innerHTML = `
<div>
  <h3>現在準備中</h3>
</div>
  `;

  content3.appendChild(view);
  page3.appendChild(content3);

})();