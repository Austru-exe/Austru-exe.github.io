const board = Array(8).fill(null).map(() => Array(8).fill(null));
const boardElement = document.getElementById('board');
const turnDisplay = document.getElementById('turn');
const resultDisplay = document.getElementById('result');

let currentTurn = 'black';
let passCount = 0;

const directions = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
  [1, 1], [-1, -1], [1, -1], [-1, 1]
];

function initBoard() {
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  render();
  checkGameEndOrPass();
}

function render() {
  boardElement.innerHTML = '';
  const legalMoves = getAllLegalMoves(currentTurn);

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      const value = board[y][x];
      if (value) {
        const disk = document.createElement('div');
        disk.className = value;
        cell.appendChild(disk);
      } else if (legalMoves.some(m => m[0] === x && m[1] === y)) {
        const hint = document.createElement('div');
        hint.className = 'hint';
        cell.appendChild(hint);
      }

      cell.addEventListener('click', handleClick);
      boardElement.appendChild(cell);
    }
  }

  turnDisplay.textContent = currentTurn === 'black' ? '黒' : '白';
}

function getAllLegalMoves(color) {
  const moves = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] === null && getFlips(x, y, color).length > 0) {
        moves.push([x, y]);
      }
    }
  }
  return moves;
}

function saveGameResult() {
  let blackCount = 0;
  let whiteCount = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === 'black') blackCount++;
      if (cell === 'white') whiteCount++;
    }
  }
  const winner = blackCount > whiteCount ? '黒' :
                 whiteCount > blackCount ? '白' :
                 '引き分け';

  const resultData = {
    id: `${Date.now()}`, // 結果の一意のID（timestampを使用）
    timestamp: new Date().toISOString(),
    winner: winner,
    blackCount: blackCount,
    whiteCount: whiteCount
  };

  // Lambda URLにPOSTリクエストを送信
  fetch('arn:aws:lambda:ap-northeast-1:191669941148:function:saveOthelloResult', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resultData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('ゲーム結果が保存されました:', data);
  })
  .catch(err => {
    console.error('結果の保存に失敗しました:', err);
  });
}


function handleClick(e) {
  const x = parseInt(e.currentTarget.dataset.x);
  const y = parseInt(e.currentTarget.dataset.y);
  if (board[y][x] !== null) return;

  const flips = getFlips(x, y, currentTurn);
  if (flips.length === 0) return;

  board[y][x] = currentTurn;
  flips.forEach(([fx, fy]) => board[fy][fx] = currentTurn);

  passCount = 0;
  currentTurn = currentTurn === 'black' ? 'white' : 'black';
  render();
  checkGameEndOrPass();
}

function getFlips(x, y, color) {
  const opponent = color === 'black' ? 'white' : 'black';
  const flips = [];

  for (let [dx, dy] of directions) {
    const temp = [];
    let cx = x + dx, cy = y + dy;
    while (cx >= 0 && cx < 8 && cy >= 0 && cy < 8) {
      const cell = board[cy][cx];
      if (cell === opponent) {
        temp.push([cx, cy]);
      } else if (cell === color) {
        flips.push(...temp);
        break;
      } else {
        break;
      }
      cx += dx;
      cy += dy;
    }
  }
  return flips;
}

function hasValidMove(color) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] === null && getFlips(x, y, color).length > 0) {
        return true;
      }
    }
  }
  return false;
}

function isBoardFull() {
  return board.every(row => row.every(cell => cell !== null));
}

function showResult() {
  // ゲーム結果の保存
  saveGameResult();

  let blackCount = 0;
  let whiteCount = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === 'black') blackCount++;
      if (cell === 'white') whiteCount++;
    }
  }
  const winner = blackCount > whiteCount ? '黒の勝ち！' :
                 whiteCount > blackCount ? '白の勝ち！' :
                 '引き分け！';

  resultDisplay.textContent = `ゲーム終了！ 黒: ${blackCount}, 白: ${whiteCount} → ${winner}`;
}


function checkGameEndOrPass() {
  if (hasValidMove(currentTurn)) {
    return;
  }

  passCount++;
  if (passCount >= 2 || isBoardFull()) {
    render();  // 勝敗表示の前に盤面を描画
    showResult();
  } else {
    resultDisplay.textContent = `${currentTurn === 'black' ? '黒' : '白'}は打てないのでパスします`;
    currentTurn = currentTurn === 'black' ? 'white' : 'black';
    render();
    checkGameEndOrPass();
  }
}

initBoard();
