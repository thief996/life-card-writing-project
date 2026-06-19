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
      name: "NPC召喚",
      image: "09_抽牌網站/card-pools/技能卡/NPC召喚.png",
      message: "今天不用單刷。召喚一位能給你資訊、陪伴或提醒的人。",
    },
    {
      name: "一步卷軸",
      image: "09_抽牌網站/card-pools/技能卡/一步卷軸.png",
      message: "不要解完整張地圖。打開卷軸，只執行下一步。",
    },
    {
      name: "微小任務術",
      image: "09_抽牌網站/card-pools/技能卡/微小任務術.png",
      message: "把任務縮到小到不能再小。完成它，讓行動感先回來。",
    },
  ],
};

const deckState = {
  ghost: { lastIndex: -1, drawCount: 0 },
  skill: { lastIndex: -1, drawCount: 0 },
};
const selectedCards = {
  ghost: null,
  skill: null,
};
const modal = document.querySelector("[data-card-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalType = document.querySelector("[data-modal-type]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalMessage = document.querySelector("[data-modal-message]");

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
  selectedCards[deckName] = card;

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

function openCardModal(deckName) {
  const card = selectedCards[deckName];

  if (!card || !card.image) {
    return;
  }

  modalImage.src = card.image;
  modalImage.alt = `${card.name}完整牌卡`;
  modalType.textContent = deckName === "ghost" ? "鬼怪卡" : "技能卡";
  modalTitle.textContent = card.name;
  modalMessage.textContent = card.message;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector(".modal-close").focus();
}

function closeCardModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-result-card]").forEach((cardElement) => {
  const deckName = cardElement.dataset.resultCard;

  cardElement.addEventListener("click", () => openCardModal(deckName));
  cardElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCardModal(deckName);
    }
  });
});

document.querySelectorAll("[data-close-modal]").forEach((closeTarget) => {
  closeTarget.addEventListener("click", closeCardModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeCardModal();
  }
});

fetch(`09_抽牌網站/card-pools/manifest.json?v=${Date.now()}`, { cache: "no-store" })
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
