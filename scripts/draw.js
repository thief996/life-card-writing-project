const decks = {
  ghost: [
    {
      name: "拖延幽影",
      image: "",
      message: "今天的怪會把事情變得很大。先做最小的一步，讓它失去霧氣。",
    },
    {
      name: "比較魔王",
      message: "它會拿別人的進度嚇你。回到自己的地圖，先完成你手上的一格。",
    },
    {
      name: "完美主義石像",
      message: "它會要求你一次做到最好。今天的破解法是先交出粗糙版本。",
    },
  ],
  skill: [
    {
      name: "三分鐘開場",
      message: "不要等狀態完整。設定三分鐘，開始就算解鎖技能。",
    },
    {
      name: "求救訊號",
      message: "把卡住的地方說清楚，傳給一個能接住你的人。",
    },
    {
      name: "任務切片",
      message: "把今天的大任務切成三片，只拿最小那片開始。",
    },
  ],
};

const deckState = {
  ghost: { lastIndex: -1, drawCount: 0 },
  skill: { lastIndex: -1, drawCount: 0 },
};

function pickCard(deckName) {
  const deck = decks[deckName];
  const state = deckState[deckName];
  let nextIndex = Math.floor(Math.random() * deck.length);

  if (deck.length > 1) {
    while (nextIndex === state.lastIndex) {
      nextIndex = Math.floor(Math.random() * deck.length);
    }
  }

  state.lastIndex = nextIndex;
  state.drawCount += 1;

  return deck[nextIndex];
}

function drawCard(deckName) {
  const card = pickCard(deckName);
  const label = deckName === "ghost" ? "鬼怪" : "技能";
  const resultCard = document.querySelector(`[data-result-card="${deckName}"]`);

  document.querySelector(`[data-card-name="${deckName}"]`).textContent = card.name;
  document.querySelector(`[data-card-message="${deckName}"]`).textContent = card.message;
  document.querySelector(`[data-draw-status="${deckName}"]`).textContent = `已抽 ${label} ${deckState[deckName].drawCount} 次`;

  if (card.image && resultCard) {
    const overlay =
      deckName === "ghost"
        ? "linear-gradient(160deg, rgba(255, 253, 245, 0.4), rgba(255, 239, 222, 0.76))"
        : "linear-gradient(160deg, rgba(255, 253, 245, 0.4), rgba(223, 234, 240, 0.76))";
    resultCard.style.backgroundImage = `${overlay}, url("${card.image}")`;
  }
}

document.querySelectorAll("[data-draw-button]").forEach((button) => {
  button.addEventListener("click", () => drawCard(button.dataset.drawButton));
});

fetch("09_抽牌網站/card-pools/manifest.json")
  .then((response) => response.json())
  .then((manifest) => {
    if (Array.isArray(manifest.ghost) && manifest.ghost.length > 0) {
      decks.ghost = manifest.ghost;
    }

    if (Array.isArray(manifest.skill) && manifest.skill.length > 0) {
      decks.skill = manifest.skill;
    }
  })
  .catch(() => {
    // Keep the built-in starter decks available when previewing from file:// or if the manifest is missing.
  });
