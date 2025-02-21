(() => {
  const page2 = document.getElementById("page2");
  const content2_1 = document.createElement("div");
  content2_1.className = "content2_1";

  const view = document.createElement("div");

  view.innerHTML = `
    <div id="home-screen">
      <h3>エリア3-10まで実装済み</h3>
      <button id="startBattle">バトル開始</button>
      <button id="openItems">アイテム</button>
      <br>
      <br>
      <button id="closegame1">一覧に戻る</button>
    </div>

    <!-- バトル画面 -->
    <div id="game-screen">
      <h3>バトル</h3>
      <div id="info-stage"></div>
      <div id="player-status">プレイヤーステータス</div>
      <div id="enemy-hp">敵HP: 0</div>
      <br>
      <button id="toggle-speed-btn">等速</button>
      <br>
      <div>バトルログ</div>
      <textarea id="battle-log"></textarea>
    </div>

    <!-- アイテム画面 -->
    <div id="item-screen">
        <div class="split-container">
          <div id="status-display"></div>
          <div class="equipment-display">
            <h3>装備</h3>
              <p>武器: <span id="weapon">なし</span> <button id="unequipWeapon">外す</button></p>
              <p>防具: <span id="armor">なし</span> <button id="unequipArmor">外す</button></p>
              <p>装具: <span id="accessory">なし</span> <button id="unequipAccessory">外す</button></p>
          </div>
        </div>
        <div>
          <button id="fuseItems">合成</button>
          <button id="closeItems">閉じる</button>
        </div>
          <h3>アイテム</h3>
          <div id="item-display"></div>
          <div id="inventory-grid"></div>
      </div>

    <!-- ドロップアイテム画面 -->
    <div id="drop-items">
      <h3>ドロップアイテム</h3>
      <button id="goHome">ホームに戻る</button>
      <ul id="item-list"></ul>
    </div>

    <!-- アイテムツールチップ -->
    <div id="item-tooltip"></div>
    `;

  content2_1.appendChild(view);
  page2.appendChild(content2_1);

  //onClickを置き換え
  const sb = document.getElementById("startBattle");
  sb.addEventListener("click", () => {
    startBattle();
  });
  const oi = document.getElementById("openItems");
  oi.addEventListener("click", () => {
    openItems();
  });
  const uw = document.getElementById("unequipWeapon");
  uw.addEventListener("click", () => {
    unequipItem("weapon");
  });
  const uar = document.getElementById("unequipArmor");
  uar.addEventListener("click", () => {
    unequipItem("armor");
  });
  const uac = document.getElementById("unequipAccessory");
  uac.addEventListener("click", () => {
    unequipItem("accessory");
  });
  const fi = document.getElementById("fuseItems");
  fi.addEventListener("click", () => {
    fuseItems();
  });
  const ci = document.getElementById("closeItems");
  ci.addEventListener("click", () => {
    closeItems();
  });
  const gh = document.getElementById("goHome");
  gh.addEventListener("click", () => {
    goHome();
  });
  const cg = document.getElementById("closegame1");
  cg.addEventListener("click", () => {
    closegame1();
  });
  const toggleButton = document.getElementById("toggle-speed-btn");
  toggleButton.addEventListener("click", () => {
    toggleBattleSpeed();
  })

  let player = {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    speed: 3,
  };
  player.name = 'player';

  let equipment = { weapon: null, armor: null, accessory: null };
  let enemy;
  let isGameOver = false;
  let dropItems = [];
  let currentArea = 1;
  let currentStage = 1;
  let inventory = Array(300).fill(null);

  const allDropItems = [
    { name: "剣", type: "武器", effect: { attack: 5 }, areaRange: [1, 10] },
    { name: "盾", type: "防具", effect: { defense: 3 }, areaRange: [1, 10] },
    {
      name: "靴",
      type: "装具",
      effect: { speed: 2, maxHp: 10 },
      areaRange: [1, 10],
    },
  ];

  const bosses = {
    10: {
      hp: 500,
      attack: 50,
      defense: 30,
      speed: 5,
      maxHp: 500,
      dropItems: [{ name: "10Fの剣", type: "武器", effect: { attack: 100 } }],
    },
    20: {
      hp: 10000,
      attack: 100,
      defense: 100,
      speed: 10,
      maxHp: 10000,
      dropItems: [{ name: "20Fの盾", type: "防具", effect: { defense: 200 } }],
    },
    30: {
      hp: 100000,
      attack: 500,
      defense: 250,
      speed: 100,
      maxHp: 100000,
      dropItems: [
        {
          name: "30Fの靴",
          type: "装具",
          effect: { attack: 300, defense: 300, speed: 300, maxHp: 300 },
        },
      ],
    },
  };
  bosses[10].name = 'boss1';
  bosses[20].name = 'boss2';
  bosses[30].name = 'boss3';

  function startBattle() {
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("item-screen").style.display = "none";
    isGameOver = false;
    player.hp = player.maxHp;
    dropItems = [];
    generateEnemy();
    battle();
  }

  function closegame1() {
    document.querySelector(".content2_1").style.display = "none";
    document.querySelector(".content2").style.display = "block";
  }

  function openItems() {
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("item-screen").style.display = "block";
    updateInventory();
  }

  function closeItems() {
    document.getElementById("item-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "block";
  }

  function generateEnemy() {
    if (currentStage === 10) {
      if (bosses[currentArea * currentStage])
        enemy = bosses[currentArea * currentStage];
      enemy.hp = bosses[currentArea * currentStage].maxHp;
    } else {
      enemy = {
        hp: 40 + (currentArea - 1) * 10 + currentStage * 1,
        attack: 5 + (currentArea - 1) * 10 + currentStage * 1,
        defense: 2 + (currentArea - 1) * 10 + currentStage * 1,
        speed: 2 + currentStage * 0.5,
      };
      enemy.name = 'enemy';
    }
    updateStatus();
  }

  let battleSpeed = 1000; // 初期速度
  let speedIndex = 0; // トグルフラグのインデックス
  const speeds = [1000, 500, 100]; // 速度の選択肢

  function toggleBattleSpeed() {
  speedIndex = (speedIndex + 1) % speeds.length; // インデックスを切り替え
  battleSpeed = speeds[speedIndex]; // 新しい速度を設定
  updateButtonLabel(); // ボタンのラベルを更新
}

function updateButtonLabel() {
  let bs = '等速';
  if(battleSpeed === 1000) {bs = '等速'}
  if(battleSpeed === 500) {bs = '倍速'}
  if(battleSpeed === 100) {bs = '10倍速'}
  toggleButton.textContent = `${bs}`;
}

  function battle() {
    const battleInterval = setInterval(() => {
      if (isGameOver) {
        clearInterval(battleInterval);
        return;
      }

      const first = player.speed >= enemy.speed ? player : enemy;
      const second = first === player ? enemy : player;

      attack(first, second);
      if (second.hp <= 0) {
        if (first === player) {
          battelLog('撃破した');
          nextStage();
        } else {
          battelLog('敗北した');
          battelLog('reset');
          gameOver();
        }
        clearInterval(battleInterval);
        return;
      }

      attack(second, first);
      if (first.hp <= 0) {
        if (second === player) {
          battelLog('撃破した');
          nextStage();
        } else {
          battelLog('敗北した');
          battelLog('reset');
          gameOver();
        }
        clearInterval(battleInterval);
        return;
      }
    }, battleSpeed);
  }

  function attack(attacker, defender) {
    defender.hp -= Math.max(1, attacker.attack - defender.defense);
    updateStatus();

    // 攻撃ログを生成
    const log = `${attacker.name} が ${defender.name} に ${Math.max(1,attacker.attack - defender.defense)} ダメージ`;
    battelLog(log);
  }

  function updateStatus() {
    document.getElementById(
      "info-stage"
    ).innerText = `エリア:${currentArea} - ${currentStage}`;
    document.getElementById("enemy-hp").innerText = `敵HP: ${enemy.hp}`;
    document.getElementById(
      "player-status"
    ).innerText = `HP: ${player.hp}, 攻撃: ${player.attack}, 防御: ${player.defense}, 速度: ${player.speed}`;
    // 変更先
    document.getElementById("weapon").innerText = equipment.weapon
      ? equipment.weapon.name
      : "なし";
    document.getElementById("armor").innerText = equipment.armor
      ? equipment.armor.name
      : "なし";
    document.getElementById("accessory").innerText = equipment.accessory
      ? equipment.accessory.name
      : "なし";
  }

  function nextStage() {
    dropItems.push(generateDropItem());
    if (currentArea === 3 && currentStage === 10) {
      gameClear();
      return;
    }
    if (currentStage === 10) {
      currentArea++;
      currentStage = 0;
    }
    currentStage++;
    generateEnemy();
    battle();
  }

  function gameOver() {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("drop-items").style.display = "block";
    displayDropItems();
    addItemsToInventory();
  }

  function gameClear() {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("drop-items").style.display = "block";
    displayDropItems();
    addItemsToInventory();
  }

  function addItemsToInventory() {
    dropItems.forEach((item) => {
      for (let i = 0; i < inventory.length; i++) {
        if (inventory[i] === null) {
          inventory[i] = item;
          break;
        }
      }
    });
    dropItems = [];
    updateInventory();
  }

  function displayDropItems() {
    const itemList = document.getElementById("item-list");
    itemList.innerHTML = "";
    dropItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} (タイプ: ${
        item.type
      }, 効果: ${Object.entries(item.effect)
        .map(([key, value]) => `${key}:${value}`)
        .join(", ")})`;
      itemList.appendChild(li);
    });
  }

  function goHome() {
    document.getElementById("drop-items").style.display = "none";
    document.getElementById("home-screen").style.display = "block";
    currentArea = 1;
    currentStage = 1;
  }

  function generateDropItem() {
    // ボスがドロップするアイテムを優先
    if (currentStage === 10 && bosses[currentArea * currentStage].dropItems) {
      // ボスがドロップするアイテムをランダムで選択
      const dropItem =
        bosses[currentArea * currentStage].dropItems[
          Math.floor(
            Math.random() * bosses[currentArea * currentStage].dropItems.length
          )
        ];
      return { ...dropItem, id: Date.now() }; // 一意のIDを生成
    }

    // ボスがドロップアイテムを持っていない場合、通常のドロップアイテムを選択
    const availableItems = allDropItems.filter(
      (item) =>
        currentArea >= item.areaRange[0] && currentArea <= item.areaRange[1]
    );

    if (availableItems.length === 0) return null; // ドロップアイテムがなければ null を返す

    const item =
      availableItems[Math.floor(Math.random() * availableItems.length)];
    return { ...item, id: Date.now() }; // 一意のIDを生成
  }

  // 装備されたアイテムを表示
  function updateEquipmentDisplay() {
    // すべてのツールチップを隠す
    hideAllTooltips();

    const weaponElement = document.getElementById("weapon");
    const armorElement = document.getElementById("armor");
    const accessoryElement = document.getElementById("accessory");

    // 装備されたアイテムを表示
    weaponElement.innerText = equipment.weapon
      ? `${equipment.weapon.name}`
      : "なし";
    armorElement.innerText = equipment.armor
      ? `${equipment.armor.name}`
      : "なし";
    accessoryElement.innerText = equipment.accessory
      ? `${equipment.accessory.name}`
      : "なし";

    // アイテムがない場合、ツールチップを隠す
    if (!equipment.weapon) hideItemTooltip();
    if (!equipment.armor) hideItemTooltip();
    if (!equipment.accessory) hideItemTooltip();

    // ホバーイベント追加
    if (equipment.weapon) {
      weaponElement.onmouseover = () =>
        showItemTooltip(equipment.weapon, weaponElement);
      weaponElement.onmouseout = () => hideItemTooltip();
    } else {
      weaponElement.onmouseover = null;
      weaponElement.onmouseout = null;
    }

    if (equipment.armor) {
      armorElement.onmouseover = () =>
        showItemTooltip(equipment.armor, armorElement);
      armorElement.onmouseout = () => hideItemTooltip();
    } else {
      armorElement.onmouseover = null;
      armorElement.onmouseout = null;
    }

    if (equipment.accessory) {
      accessoryElement.onmouseover = () =>
        showItemTooltip(equipment.accessory, accessoryElement);
      accessoryElement.onmouseout = () => hideItemTooltip();
    } else {
      accessoryElement.onmouseover = null;
      accessoryElement.onmouseout = null;
    }
  }

  function hideAllTooltips() {
    hideItemTooltip();
  }

  // アイテムツールチップを表示
  function showItemTooltip(item, targetElement) {
    if (!item) return; // itemがnullまたはundefinedの場合は処理を中断
    const tooltip = document.getElementById("item-tooltip");
    tooltip.style.display = "block";

    // ツールチップの基本位置を計算
    let top =
      targetElement.getBoundingClientRect().top +
      window.scrollY +
      targetElement.offsetHeight +
      5;
    let left = targetElement.getBoundingClientRect().left + window.scrollX;

    // ツールチップの幅と高さを取得
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // 画面の幅と高さを取得
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 右端に対する位置調整
    if (left + tooltipWidth > viewportWidth) {
      left = viewportWidth - tooltipWidth - 50; // 50pxのマージンを追加
    }

    // 下端に対する位置調整
    if (top + tooltipHeight > viewportHeight) {
      top =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        tooltipHeight -
        5;
    }

    // 調整後の位置を設定
    tooltip.style.top = top + "px";
    tooltip.style.left = left + "px";

    const effectText = formatEffects(item.effect);
    tooltip.innerHTML = `<strong>${item.name}</strong><br/>効果: ${effectText}`;
  }

  // アイテムツールチップを非表示にする
  function hideItemTooltip() {
    const tooltip = document.getElementById("item-tooltip");
    tooltip.style.display = "none";
  }

  // アイテムの効果をフォーマットする
  function formatEffects(effect) {
    return Object.entries(effect)
      .map(([key, value]) => `${key}: ${value}`)
      .join("<br/>");
  }

  function unequipItem(type) {
    const item = equipment[type];
    if (item) {
      Object.keys(item.effect).forEach((effect) => {
        player[effect] -= item.effect[effect];
      });
      addToInventory(item);
      equipment[type] = null;
    }

    // 装備状況を更新
    updateEquipmentDisplay();
    player.hp = player.maxHp;
    updateStatus();
    updateInventory();
  }

  function addToInventory(item) {
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i] === null) {
        inventory[i] = item;
        break;
      }
    }
  }

  // インベントリ表示のアイテム選択を更新する
  function updateInventory() {
    const inventoryGrid = document.getElementById("inventory-grid");
    const statusDiv = document.getElementById("status-display");
    const itemDisplay = document.getElementById("item-display");
    inventoryGrid.innerHTML = "";

    statusDiv.innerHTML = `
      <h3>プレイヤーステータス</h3>
      <p>HP: ${player.maxHp}</p>
      <p>攻撃: ${player.attack}</p>
      <p>防御: ${player.defense}</p>
      <p>速度: ${player.speed}</p>
    `;

    itemDisplay.innerHTML = "";

    // 空でないインベントリスロットだけを抽出してソート
    const filledSlots = inventory
      .filter((item) => item !== null)
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });

    for (let i = 0; i < 300; i++) {
      const slot = document.createElement("div");
      slot.className = "inventory-slot";

      if (i < filledSlots.length) {
        const currentItem = filledSlots[i];
        slot.innerText = currentItem.name;
        slot.onmouseover = () => {
          if (currentItem) showItemTooltip(currentItem, slot);
        };
        slot.onmouseout = () => hideItemTooltip();
        slot.onclick = () => {
          if (currentItem) {
            if (mode === "equip") {
              equipItem(currentItem);
            } else if (mode === "fuse") {
              selectItemForFusion(currentItem);
            }
          }
        };
      }

      inventoryGrid.appendChild(slot);
    }
  }

  // インベントリからアイテムを削除する処理
  function removeItemFromInventory(item) {
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i] && inventory[i].name === item.name) {
        inventory[i] = null;
        break;
      }
    }
  }

  // アイテムを装備する処理
  function equipItem(item) {
    if (!item) return; // nullやundefinedの場合は処理を中断

    switch (item.type) {
      case "武器":
        if (equipment.weapon) {
          unequipItem("weapon");
        }
        equipment.weapon = item;
        break;
      case "防具":
        if (equipment.armor) {
          unequipItem("armor");
        }
        equipment.armor = item;
        break;
      case "装具":
        if (equipment.accessory) {
          unequipItem("accessory");
        }
        equipment.accessory = item;
        break;
    }

    function applyItemEffects(item) {
      if (item.effect.attack) player.attack += item.effect.attack;
      if (item.effect.defense) player.defense += item.effect.defense;
      if (item.effect.speed) player.speed += item.effect.speed;
      if (item.effect.maxHp) player.maxHp += item.effect.maxHp;
    }
    applyItemEffects(item);

    // 装備したアイテムをインベントリから削除
    removeItemFromInventory(item);

    // 装備したアイテムをinventoryGridから削除
    updateInventory();

    // 装備状況を更新
    updateEquipmentDisplay();
    player.hp = player.maxHp;
    updateStatus();
  }


  // モードを示す変数
  let mode = "equip"; // 初期値は 'equip' モード

  // 合成ボタンをクリックした際の処理
  function fuseItems() {
    // モードを 'fuse' に設定
    mode = "fuse";

    // 合成を実行
    fuseAllPossibleItems();

    // 合成後、モードを 'equip' に戻す
    mode = "equip";
  }

  // インベントリ内の全ての合成可能なアイテムを合成する関数
  function fuseAllPossibleItems() {
    // 同じ名前のアイテムペアを探す
    const itemPairs = {};

    // インベントリ内のアイテムを走査
    inventory.forEach((item) => {
      // アイテムが null または undefined でないことを確認
      if (item && item.name) {
        if (!itemPairs[item.name]) {
          itemPairs[item.name] = [];
        }
        itemPairs[item.name].push(item);
      }
    });

    // ペアを合成する
    for (const itemName in itemPairs) {
      if (itemPairs[itemName].length >= 2) {
        // 2つ以上の同じ名前のアイテムがある場合、ペアを作成
        while (itemPairs[itemName].length > 1) {
          const item1 = itemPairs[itemName].pop();
          const item2 = itemPairs[itemName].pop();

          // ここで、アイテムを渡して合成を行う
          if (item1 && item2) {
            // item1 と item2 が null または undefined でないことを確認
            fuseItem(item1, item2);
          }
        }
      }
    }
  }

  // アイテムを合成する関数
  function fuseItem(item1, item2) {
    if (item1.name !== item2.name) {
      return;
    }

    let newItemName = "";
    const itemName = item1.name;
    const match = itemName.match(/(.+?)\+?(\d+)?$/);

    if (match) {
      const baseName = match[1]; // アイテムの基本名を取得
      const number = match[2] ? parseInt(match[2]) : 0; // 数字部分を取得（なければ0）
      newItemName = `${baseName}+${number + 1}`; // 数字をインクリメント
    } else {
      newItemName = `${itemName}+1`; // 基本名の後に+1を追加
    }

    const newItemEffect = {};

    for (const key in item1.effect) {
      newItemEffect[key] = Math.ceil(
        0.75 * (item1.effect[key] + item2.effect[key])
      );
    }

    const fusedItem = {
      name: newItemName,
      type: item1.type,
      effect: newItemEffect,
    };

    // 合成されたアイテムをインベントリに追加
    addToInventory(fusedItem);

    // 合成したアイテムをインベントリから削除
    removeItemFromInventory(item1);
    removeItemFromInventory(item2);

    updateInventory();
  }

  function battelLog(log) {
    const bl = document.getElementById("battle-log");

    // 改行を追加しながらテキストを追加
    if (bl.value === "") {
      bl.value = log;
    } else {
      bl.value += "\n" + log;
    };
    if(log === 'reset') {bl.value = ""};
    // テキストエリアを一番下にスクロール
    bl.scrollTop = bl.scrollHeight;
  }

  //最初はクローズしておく
  closegame1();
})();
