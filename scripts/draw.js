const starterDeck = [
  {
    type: "鬼怪卡",
    name: "拖延幽影",
    message: "今天的怪會把事情變得很大。先做最小的一步，讓它失去霧氣。",
  },
  {
    type: "技能卡",
    name: "三分鐘開場",
    message: "不要等狀態完整。設定三分鐘，開始就算解鎖技能。",
  },
  {
    type: "人格晶體",
    name: "安靜觀察者",
    message: "你不用立刻反應。先看清楚局面，再決定要把力氣放在哪裡。",
  },
];

const button = document.querySelector("[data-draw-button]");
const statusText = document.querySelector("[data-draw-status]");
const cardType = document.querySelector("[data-card-type]");
const cardName = document.querySelector("[data-card-name]");
const cardMessage = document.querySelector("[data-card-message]");
let lastIndex = -1;
let drawCount = 0;

function drawCard() {
  let nextIndex = Math.floor(Math.random() * starterDeck.length);

  if (starterDeck.length > 1) {
    while (nextIndex === lastIndex) {
      nextIndex = Math.floor(Math.random() * starterDeck.length);
    }
  }

  const card = starterDeck[nextIndex];
  lastIndex = nextIndex;
  drawCount += 1;

  cardType.textContent = card.type;
  cardName.textContent = card.name;
  cardMessage.textContent = card.message;
  statusText.textContent = `已抽 ${drawCount} 次`;
}

button.addEventListener("click", drawCard);
