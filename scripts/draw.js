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
  let nextY = wrapCanvasText(context, challengeTask.textContent, 96, 1050, 888, 50);

  context.fillStyle = "#1f6f78";
  context.font = "900 30px Microsoft JhengHei, sans-serif";
  context.fillText("任務選項", 96, nextY + 18);
  context.fillStyle = "#2d3f46";
  context.font = "400 28px Microsoft JhengHei, sans-serif";
  nextY += 64;
  (challengeState.skill.actions || []).slice(0, 3).forEach((action, index) => {
    nextY = wrapCanvasText(context, `${index + 1}. ${action}`, 112, nextY, 840, 38);
  });

  if (challengeState.skill.drops?.length) {
    context.fillStyle = "#1f6f78";
    context.font = "900 28px Microsoft JhengHei, sans-serif";
    context.fillText(`可能掉落：${challengeState.skill.drops.join(" / ")}`, 96, nextY + 24);
    nextY += 62;
  }

  if (challengeState.ghost.gmNote) {
    context.fillStyle = "#a94f4f";
    context.font = "900 28px Microsoft JhengHei, sans-serif";
    context.fillText("GM備註", 96, nextY + 16);
    context.fillStyle = "#2d3f46";
    context.font = "400 27px Microsoft JhengHei, sans-serif";
    wrapCanvasText(context, challengeState.ghost.gmNote, 96, nextY + 56, 888, 38);
  }

  context.fillStyle = "rgba(45, 63, 70, 0.5)";
  context.font = "700 28px Microsoft JhengHei, sans-serif";
  context.fillText("人生打怪圖鑑", 96, 1238);

  const link = document.createElement("a");
  link.download = `今日挑戰_${challengeState.ghost.name}_${challengeState.skill.name}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  writeMetric("challengeDownloads", `${challengeState.ghost.name} + ${challengeState.skill.name}`);
}

challengeDownload.addEventListener("click", downloadChallengeCard);
updateChallenge();

function getFormValuesByName(formData, name) {
  return formData.getAll(name).filter(Boolean).join("、") || "未填";
}

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
    `1. 最有感的鬼怪：${getFormValuesByName(formData, "ghost")}`,
    `其他鬼怪：${formData.get("ghostOther") || "未填"}`,
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
