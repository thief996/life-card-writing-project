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
const modal = document.querySelector("[data-card-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalType = document.querySelector("[data-modal-type]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalMessage = document.querySelector("[data-modal-message]");
const challengeDate = document.querySelector("[data-challenge-date]");
const challengeGhost = document.querySelector("[data-challenge-ghost]");
const challengeSkill = document.querySelector("[data-challenge-skill]");
const challengeTask = document.querySelector("[data-challenge-task]");
const challengeStatus = document.querySelector("[data-challenge-status]");
const challengeDownload = document.querySelector("[data-download-challenge]");
const challengeState = {
  ghost: null,
  skill: null,
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

  return deck[nextIndex];
}

function pickUniqueCards(deckName, count) {
  const deck = [...decks[deckName]];
  const picks = [];

  while (deck.length > 0 && picks.length < count) {
    const nextIndex = Math.floor(Math.random() * deck.length);
    picks.push(deck.splice(nextIndex, 1)[0]);
  }

  return picks;
}

function renderCard(deckName, card, resultCard, targetKey) {
  resultCard.dataset.cardImage = card.image || "";
  resultCard.dataset.cardName = card.name;
  resultCard.dataset.cardMessage = card.message;

  document.querySelector(`[data-card-name="${targetKey}"]`).textContent = card.name;
  document.querySelector(`[data-card-message="${targetKey}"]`).textContent = card.message;

  if (card.image && resultCard) {
    const overlay =
      deckName === "ghost"
        ? "linear-gradient(160deg, rgba(255, 253, 245, 0.4), rgba(255, 239, 222, 0.76))"
        : "linear-gradient(160deg, rgba(255, 253, 245, 0.4), rgba(223, 234, 240, 0.76))";
    resultCard.style.backgroundImage = `${overlay}, url("${card.image}")`;
  }
}

function updateChallenge() {
  const today = new Date();
  challengeDate.textContent = today.toLocaleDateString("zh-Hant-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  challengeGhost.textContent = challengeState.ghost?.name || "尚未抽鬼怪";
  challengeSkill.textContent = challengeState.skill?.name || "請從三張技能卡選一張";

  if (challengeState.ghost && challengeState.skill) {
    challengeTask.textContent = `今日挑戰：面對「${challengeState.ghost.name}」，請使用「${challengeState.skill.name}」。先做一個 10 分鐘內能完成的小行動，讓今天的關卡開始鬆動。`;
    challengeStatus.textContent = "今日挑戰已生成";
    challengeDownload.disabled = false;
    return;
  }

  challengeTask.textContent = "抽出鬼怪與技能後，這裡會生成你的今日挑戰。";
  challengeStatus.textContent = challengeState.ghost ? "請從三張技能卡選一張" : "先抽鬼怪，再選技能";
  challengeDownload.disabled = true;
}

function drawCard(deckName) {
  const label = deckName === "ghost" ? "鬼怪" : "技能";
  deckState[deckName].drawCount += 1;

  if (deckName === "skill") {
    const cards = pickUniqueCards("skill", 3);

    document.querySelectorAll(".skill-card-option").forEach((cardElement) => {
      cardElement.classList.remove("is-selected");
    });
    challengeState.skill = null;

    cards.forEach((card, index) => {
      const resultCard = document.querySelector(`[data-result-card="skill"][data-card-index="${index}"]`);
      renderCard("skill", card, resultCard, `skill-${index}`);
    });

    document.querySelector(`[data-draw-status="${deckName}"]`).textContent = `已抽 ${label} ${deckState[deckName].drawCount} 次`;
    updateChallenge();
    return;
  }

  const card = pickCard(deckName);
  const resultCard = document.querySelector(`[data-result-card="${deckName}"]`);
  renderCard(deckName, card, resultCard, deckName);
  challengeState.ghost = card;
  document.querySelector(`[data-draw-status="${deckName}"]`).textContent = `已抽 ${label} ${deckState[deckName].drawCount} 次`;
  updateChallenge();
}

document.querySelectorAll("[data-draw-button]").forEach((button) => {
  button.addEventListener("click", () => drawCard(button.dataset.drawButton));
});

function openCardModal(resultCard) {
  const deckName = resultCard.dataset.resultCard;
  const card = {
    image: resultCard.dataset.cardImage,
    name: resultCard.dataset.cardName,
    message: resultCard.dataset.cardMessage,
  };

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

function selectSkillCard(cardElement) {
  if (cardElement.dataset.resultCard !== "skill" || !cardElement.dataset.cardImage) {
    return;
  }

  document.querySelectorAll(".skill-card-option").forEach((skillCard) => {
    skillCard.classList.remove("is-selected");
  });

  cardElement.classList.add("is-selected");
  challengeState.skill = {
    image: cardElement.dataset.cardImage,
    name: cardElement.dataset.cardName,
    message: cardElement.dataset.cardMessage,
  };
  updateChallenge();
}

document.querySelectorAll("[data-result-card]").forEach((cardElement) => {
  cardElement.addEventListener("click", () => {
    selectSkillCard(cardElement);
    openCardModal(cardElement);
  });
  cardElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSkillCard(cardElement);
      openCardModal(cardElement);
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

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split("");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const testLine = line + word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  context.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function downloadChallengeCard() {
  if (!challengeState.ghost || !challengeState.skill) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fff4cf");
  gradient.addColorStop(0.48, "#f9f1df");
  gradient.addColorStop(1, "#dfeaf0");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(49, 152, 150, 0.16)";
  context.beginPath();
  context.arc(140, 160, 220, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(215, 127, 112, 0.18)";
  context.beginPath();
  context.arc(940, 260, 260, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(216, 167, 70, 0.72)";
  context.lineWidth = 8;
  context.strokeRect(58, 58, 964, 1234);

  context.fillStyle = "#2d3f46";
  context.font = "900 76px Microsoft JhengHei, sans-serif";
  context.fillText("今日挑戰", 92, 170);

  context.fillStyle = "#1f6f78";
  context.font = "800 34px Microsoft JhengHei, sans-serif";
  context.fillText(challengeDate.textContent, 96, 230);

  context.fillStyle = "rgba(255, 253, 245, 0.82)";
  context.fillRect(92, 300, 896, 270);
  context.fillRect(92, 620, 896, 270);

  context.fillStyle = "#a94f4f";
  context.font = "900 34px Microsoft JhengHei, sans-serif";
  context.fillText("面對的鬼怪", 132, 360);
  context.fillStyle = "#2d3f46";
  context.font = "900 62px Microsoft JhengHei, sans-serif";
  context.fillText(challengeState.ghost.name, 132, 440);
  context.font = "400 32px Microsoft JhengHei, sans-serif";
  wrapCanvasText(context, challengeState.ghost.message, 132, 505, 820, 44);

  context.fillStyle = "#1f6f78";
  context.font = "900 34px Microsoft JhengHei, sans-serif";
  context.fillText("選擇的技能", 132, 680);
  context.fillStyle = "#2d3f46";
  context.font = "900 62px Microsoft JhengHei, sans-serif";
  context.fillText(challengeState.skill.name, 132, 760);
  context.font = "400 32px Microsoft JhengHei, sans-serif";
  wrapCanvasText(context, challengeState.skill.message, 132, 825, 820, 44);

  context.fillStyle = "#2d3f46";
  context.font = "900 38px Microsoft JhengHei, sans-serif";
  context.fillText("今日任務", 96, 990);
  context.font = "400 34px Microsoft JhengHei, sans-serif";
  wrapCanvasText(context, challengeTask.textContent, 96, 1050, 888, 50);

  context.fillStyle = "rgba(45, 63, 70, 0.5)";
  context.font = "700 28px Microsoft JhengHei, sans-serif";
  context.fillText("人生打怪圖鑑", 96, 1238);

  const link = document.createElement("a");
  link.download = `今日挑戰_${challengeState.ghost.name}_${challengeState.skill.name}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

challengeDownload.addEventListener("click", downloadChallengeCard);
updateChallenge();

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
