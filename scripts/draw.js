const decks = {
  ghost: [
    {
      name: "拖延幽影",
      image: "",
      message: "牠會把普通任務膨脹成巨大工程，讓你越看越累，最後連開始都覺得太重。",
    },
    {
      name: "比較魔王",
      message: "它會把別人的進度貼到你眼前，讓你覺得自己永遠落後，連原本的步伐都亂掉。",
    },
    {
      name: "完美主義石像",
      message: "它會要求你一次做到最好，讓任何不夠完整的開始都像失敗。",
    },
  ],
  skill: [
    {
      name: "NPC召喚",
      image: "09_抽牌網站/card-pools/技能卡/NPC召喚.png",
      message: "今天不用單刷。召喚一位能給你資訊、陪伴或提醒的人。",
      actions: ["傳訊息給一位信任的人", "問一個卡住已久的問題", "更新近況，讓對方知道你正在打這關"],
      drops: ["求助", "陪伴", "勇氣"],
    },
    {
      name: "一步卷軸",
      image: "09_抽牌網站/card-pools/技能卡/一步卷軸.png",
      message: "不要解完整張地圖。打開卷軸，只執行下一步。",
      actions: ["把今天最卡的事寫成一句話", "只圈出下一個 5 分鐘能做的動作", "完成後立刻停下來打勾"],
      drops: ["啟動", "清晰", "行動感"],
    },
    {
      name: "微小任務術",
      image: "09_抽牌網站/card-pools/技能卡/微小任務術.png",
      message: "把任務縮到小到不能再小。完成它，讓行動感先回來。",
      actions: ["把任務縮成一個可以立刻開始的版本", "只做第一個步驟", "做完後記下：我已經動了"],
      drops: ["完成感", "節奏", "自信"],
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
const challengeActions = document.querySelector("[data-challenge-actions]");
const challengeActionList = document.querySelector("[data-challenge-action-list]");
const challengeDrops = document.querySelector("[data-challenge-drops]");
const challengeDropList = document.querySelector("[data-challenge-drop-list]");
const challengeGm = document.querySelector("[data-challenge-gm]");
const challengeStatus = document.querySelector("[data-challenge-status]");
const challengeDownload = document.querySelector("[data-download-challenge]");
const feedbackForm = document.querySelector("[data-feedback-form]");
const feedbackGhostSelect = document.querySelector("[data-feedback-ghost-select]");
const feedbackStatus = document.querySelector("[data-feedback-status]");
const challengeState = {
  ghost: null,
  skill: null,
};

const metricsKey = "lifeQuestAlpha03Metrics";

function readMetrics() {
  try {
    return JSON.parse(localStorage.getItem(metricsKey)) || {};
  } catch {
    return {};
  }
}

function writeMetric(type, name) {
  try {
    const metrics = readMetrics();
    metrics[type] = metrics[type] || {};
    const key = name || "unknown";
    metrics[type][key] = (metrics[type][key] || 0) + 1;
    metrics.lastPlayedAt = new Date().toISOString();
    localStorage.setItem(metricsKey, JSON.stringify(metrics));
  } catch {
    // Metrics are helpful for Alpha testing, but gameplay should never depend on localStorage.
  }
}

function readJsonDataset(value, fallback = []) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function renderTextList(listElement, items, ordered = false) {
  listElement.replaceChildren();
  items.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = ordered ? item : item;
    listElement.appendChild(listItem);
  });
}

function updateFeedbackGhostOptions() {
  if (!feedbackGhostSelect) {
    return;
  }

  const selectedValue = feedbackGhostSelect.value;
  feedbackGhostSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "請選擇一隻鬼怪";
  feedbackGhostSelect.appendChild(placeholder);

  decks.ghost.forEach((ghost) => {
    const option = document.createElement("option");
    option.value = ghost.name;
    option.textContent = ghost.name;
    feedbackGhostSelect.appendChild(option);
  });

  if ([...feedbackGhostSelect.options].some((option) => option.value === selectedValue)) {
    feedbackGhostSelect.value = selectedValue;
  }
}

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
  resultCard.dataset.cardActions = JSON.stringify(card.actions || []);
  resultCard.dataset.cardDrops = JSON.stringify(card.drops || []);
  resultCard.dataset.cardGmNote = card.gmNote || "";

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
    const actions = challengeState.skill.actions || [];
    const drops = challengeState.skill.drops || [];

    challengeTask.textContent = `今日副本：面對「${challengeState.ghost.name}」，請使用「${challengeState.skill.name}」。從下方任務選一項完成，讓今天的關卡開始鬆動。`;
    renderTextList(challengeActionList, actions, true);
    challengeActions.hidden = actions.length === 0;
    renderTextList(challengeDropList, drops);
    challengeDrops.hidden = drops.length === 0;
    challengeGm.textContent = challengeState.ghost.gmNote ? `GM備註：${challengeState.ghost.gmNote}` : "";
    challengeGm.hidden = !challengeState.ghost.gmNote;
    challengeStatus.textContent = "今日挑戰已生成";
    challengeDownload.disabled = false;
    return;
  }

  challengeTask.textContent = "抽出鬼怪與技能後，這裡會生成你的今日挑戰。";
  challengeActions.hidden = true;
  challengeDrops.hidden = true;
  challengeGm.hidden = true;
  challengeActionList.replaceChildren();
  challengeDropList.replaceChildren();
  challengeGm.textContent = "";
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
  writeMetric("ghostDraws", card.name);
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
    actions: readJsonDataset(resultCard.dataset.cardActions),
    drops: readJsonDataset(resultCard.dataset.cardDrops),
    gmNote: resultCard.dataset.cardGmNote,
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
    actions: readJsonDataset(cardElement.dataset.cardActions),
    drops: readJsonDataset(cardElement.dataset.cardDrops),
  };
  writeMetric("skillSelections", challengeState.skill.name);
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

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("missing image source"));
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawContainedImage(context, image, x, y, width, height) {
  context.fillStyle = "rgba(255, 253, 245, 0.88)";
  context.fillRect(x, y, width, height);

  if (!image) {
    return;
  }

  const imageRatio = image.width / image.height;
  const boxRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let drawX = x;
  let drawY = y;

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio;
    drawY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * imageRatio;
    drawX = x + (width - drawWidth) / 2;
  }

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.strokeStyle = "rgba(216, 167, 70, 0.64)";
  context.lineWidth = 4;
  context.strokeRect(x, y, width, height);
}

function drawRoundedPanel(context, x, y, width, height, radius = 0) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fill();
}

async function downloadChallengeCard() {
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
  context.strokeRect(44, 44, 992, 1262);

  context.fillStyle = "#2d3f46";
  context.font = "900 58px Microsoft JhengHei, sans-serif";
  context.fillText("今日挑戰", 76, 130);

  context.fillStyle = "#1f6f78";
  context.font = "800 28px Microsoft JhengHei, sans-serif";
  context.fillText(challengeDate.textContent, 80, 178);

  const [ghostImage, skillImage] = await Promise.all([
    loadCanvasImage(challengeState.ghost.image).catch(() => null),
    loadCanvasImage(challengeState.skill.image).catch(() => null),
  ]);

  drawContainedImage(context, ghostImage, 64, 218, 460, 636);
  drawContainedImage(context, skillImage, 556, 218, 460, 636);

  context.fillStyle = "rgba(255, 253, 245, 0.92)";
  drawRoundedPanel(context, 64, 884, 952, 126, 0);

  context.fillStyle = "#a94f4f";
  context.font = "900 26px Microsoft JhengHei, sans-serif";
  context.fillText("面對的鬼怪", 98, 928);
  context.fillStyle = "#2d3f46";
  context.font = "900 40px Microsoft JhengHei, sans-serif";
  context.fillText(challengeState.ghost.name, 98, 978);

  context.fillStyle = "#1f6f78";
  context.font = "900 26px Microsoft JhengHei, sans-serif";
  context.fillText("選擇的技能", 566, 928);
  context.fillStyle = "#2d3f46";
  context.font = "900 40px Microsoft JhengHei, sans-serif";
  context.fillText(challengeState.skill.name, 566, 978);

  context.fillStyle = "rgba(255, 253, 245, 0.72)";
  drawRoundedPanel(context, 64, 1042, 952, 176, 0);

  context.fillStyle = "#2d3f46";
  context.font = "900 30px Microsoft JhengHei, sans-serif";
  context.fillText("今日任務選項", 96, 1094);
  context.fillStyle = "#3e4e54";
  context.font = "400 26px Microsoft JhengHei, sans-serif";
  let nextY = 1140;
  (challengeState.skill.actions || []).slice(0, 3).forEach((action, index) => {
    nextY = wrapCanvasText(context, `${index + 1}. ${action}`, 112, nextY, 824, 34);
  });

  context.fillStyle = "rgba(45, 63, 70, 0.5)";
  context.font = "700 26px Microsoft JhengHei, sans-serif";
  context.fillText("人生打怪圖鑑", 76, 1266);

  const link = document.createElement("a");
  link.download = `今日挑戰_${challengeState.ghost.name}_${challengeState.skill.name}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  writeMetric("challengeDownloads", `${challengeState.ghost.name} + ${challengeState.skill.name}`);
}

challengeDownload.addEventListener("click", downloadChallengeCard);
updateChallenge();

function buildFeedbackText() {
  const formData = new FormData(feedbackForm);
  const date = new Date().toLocaleString("zh-Hant-TW");
  const currentGhost = challengeState.ghost?.name || "尚未抽鬼怪";
  const currentSkill = challengeState.skill?.name || "尚未選技能";

  return [
    "人生打怪圖鑑 Alpha 測試回饋",
    `填寫時間：${date}`,
    `今日鬼怪：${currentGhost}`,
    `今日技能：${currentSkill}`,
    "",
    `1. 最有感的鬼怪：${formData.get("ghost") || "未填"}`,
    `2. 最喜歡的技能：${formData.get("favoriteSkill") || "未填"}`,
    `3. 看到鬼怪時的感覺：${formData.get("ghostFeeling") || "未填"}`,
    `4. 今日任務容易完成嗎：${formData.get("taskDifficulty") || "未填"}`,
    `5. 哪裡最卡：${formData.get("stuckPoint") || "未填"}`,
    `6. 推薦分數：${formData.get("recommendScore") || "未填"}`,
    `7. 玩完後最想說的一句話：${formData.get("oneLine") || "未填"}`,
    "",
    `考古員原話：${formData.get("rawQuote") || "未填"}`,
  ].join("\n");
}

function setFeedbackStatus(message) {
  feedbackStatus.textContent = message;
}

function downloadFeedbackText() {
  const blob = new Blob([buildFeedbackText()], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.download = `人生打怪圖鑑_Alpha回饋_${Date.now()}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  writeMetric("feedbackDownloads", "txt");
  setFeedbackStatus("已下載回饋 TXT");
}

document.querySelector("[data-copy-feedback]").addEventListener("click", async () => {
  const feedbackText = buildFeedbackText();

  try {
    await navigator.clipboard.writeText(feedbackText);
    writeMetric("feedbackCopies", "clipboard");
    setFeedbackStatus("已複製回饋內容");
  } catch {
    downloadFeedbackText();
  }
});

document.querySelector("[data-download-feedback]").addEventListener("click", downloadFeedbackText);
updateFeedbackGhostOptions();

fetch(`09_抽牌網站/card-pools/manifest.json?v=${Date.now()}`, { cache: "no-store" })
  .then((response) => response.json())
  .then((manifest) => {
    if (Array.isArray(manifest.ghost) && manifest.ghost.length > 0) {
      decks.ghost = manifest.ghost;
      updateFeedbackGhostOptions();
    }

    if (Array.isArray(manifest.skill) && manifest.skill.length > 0) {
      decks.skill = manifest.skill;
    }
  })
  .catch(() => {
    // Keep the built-in starter decks available when previewing from file:// or if the manifest is missing.
  });
