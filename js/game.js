/* =====================================================
   山川ドキドキ！恋愛シミュレーションゲーム
   ゲーム本体
   ※修正版:初期化まわりの構文エラー・スコープバグを修正
===================================================== */

import {
  parseScenario,
  applyCommand
} from "./scenarioEngine.js";

import {
  characters
} from "./characters.js";

import {
  backgrounds
} from "./backgrounds.js";

import {
  cuts
} from "./cuts.js";

import {
  loadSave,
  saveState,
  clearSave
} from "./save.js";


/* =====================================================
   DOM
===================================================== */

const gameScreen =
  document.getElementById("gameScreen");

const backgroundElement =
  document.getElementById("background");

const charactersLayer =
  document.getElementById("charactersLayer");

const nameElement =
  document.getElementById("characterName");

const textElement =
  document.getElementById("dialogueText");

const dialogueBox =
  document.getElementById("dialogueBox");

const choicesContainer =
  document.getElementById("choicesContainer");

const nextFileButton =
  document.getElementById("nextFileButton");

const nextFileText =
  document.getElementById("nextFileText");

const skipButton =
  document.getElementById("skipButton");

const characterButton =
  document.getElementById("characterButton");

const menuButton =
  document.getElementById("menuButton");

const cutScreen =
  document.getElementById("cutScreen");

const storyStartScreen =
  document.getElementById("storyStartScreen");

const episodeTitleScreen =
  document.getElementById("episodeTitleScreen");

const episodeTitleText =
  document.getElementById("episodeTitleText");


/* =====================================================
   ゲーム状態
===================================================== */

let currentFile = "opening.js";

let commands = [];

let commandIndex = 0;

let state = {
  background: null,
  visibleCharacters: [],
  talker: "",
  text: "",
  type: "",
  nextFile: null,
  unlockedCharacters: [],
  choices: {}
};


/* =====================================================
   タイプライター
===================================================== */

let typingTimer = null;

let isTyping = false;

let fullText = "";

let currentLineCount = 1;


/* =====================================================
   カット中か
===================================================== */

let isPlayingCut = false;


/* =====================================================
   シナリオ読み込み
===================================================== */

async function loadScenarioFile(
  fileName,
  startIndex = 0
) {

  try {

    const response =
      await fetch(`scenario/${fileName}`);

    if (!response.ok) {

      throw new Error(
        `シナリオを読み込めませんでした: ${fileName}`
      );
    }

    const raw =
      await response.text();

    commands =
      parseScenario(raw);

    currentFile =
      fileName;

    commandIndex =
      Number(startIndex) || 0;

    state = {
      background: null,
      visibleCharacters: [],
      talker: "",
      text: "",
      type: "",
      nextFile: null,
      unlockedCharacters: state.unlockedCharacters || [],
      choices: state.choices || {}
    };

    hideNextFile();
    clearChoices();

    runNextCommand();

  } catch (error) {

    console.error(error);

    alert(
      "シナリオの読み込みに失敗しました。\n" +
      error.message
    );
  }
}


/* =====================================================
   次のコマンド
===================================================== */

function runNextCommand() {

  stopTyping();
  clearChoices();
  hideNextFile();

  while (commandIndex < commands.length) {

    const command = commands[commandIndex];
    commandIndex++;

    /* カット */
    if (command.type === "cut") {
      playCut(command.name);
      return;
    }

    /* 選択肢 */
    if (command.type === "choice") {
      showChoices(command);
      return;
    }

    /* 次のファイル */
    if (command.type === "file") {

      /*
        修正点:
        opening.js からの遷移時は
        学園生活スタート演出を挟み、
        渡された次のファイル名(command.value)を
        そのまま次の読み込み先として使う。
      */

      if (currentFile === "opening.js") {
        showStoryStartTitle(command.value);
      } else {
        showNextFile(command.value);
      }

      return;
    }

    /* 通常コマンド */
    state = applyCommand(command, state);

    if (command.type === "b") {
      updateBackground();
      continue;
    }

    if (command.type === "c") {
      renderCharacters();
      continue;
    }

    if (command.type === "t") {
      updateName();
      continue;
    }

    if (command.type === "s") {
      showDialogue(state.text);
      return;
    }
  }

  finishCommands();
}


/* =====================================================
   分岐からの復帰

   選択肢のあとに同ファイル内の番号ラベルへ
   一時的に分岐した場合、分岐のコマンド列を
   読み終えたらここで元の位置(共通処理)へ戻す。
===================================================== */

let branchReturn = null;

function startBranch(branchCommands) {

  branchReturn = {
    commands: commands,
    commandIndex: commandIndex
  };

  commands = branchCommands;
  commandIndex = 0;

  runNextCommand();
}

function finishCommands() {

  if (branchReturn) {

    commands = branchReturn.commands;
    commandIndex = branchReturn.commandIndex;

    branchReturn = null;

    runNextCommand();

    return;
  }

  showEndOfFile();
}


/* =====================================================
   背景更新
===================================================== */

function updateBackground() {

  if (!state.background) {
    return;
  }

  const image = backgrounds[state.background];

  if (!image) {
    console.warn("背景が登録されていません:", state.background);
    return;
  }

  backgroundElement.style.backgroundImage = `url("${image}")`;
}


/* =====================================================
   キャラクター表示
===================================================== */

function renderCharacters() {

  charactersLayer.innerHTML = "";

  state.visibleCharacters.forEach(character => {

    const data = characters[character.name];

    if (!data) {
      console.warn("キャラクターが登録されていません:", character.name);
      return;
    }

    const imagePath =
      data.images[character.expression] ||
      data.images["通常"] ||
      data.images["normal"];

    if (!imagePath) {
      console.warn(
        "キャラクター画像がありません:",
        character.name,
        character.expression
      );
      return;
    }

    const img = document.createElement("img");

    img.className = `character character-${character.position}`;
    img.src = imagePath;
    img.alt = character.name;
    img.draggable = false;

    img.addEventListener("click", event => {
      event.stopPropagation();
    });

    charactersLayer.appendChild(img);
  });

  updateName();
}


/* =====================================================
   名前
===================================================== */

function updateName() {

  const talker = state.talker || "";

  nameElement.textContent = talker;

  const data = characters[talker];
  const color = (data && data.color) || "#ffc1da";

  if (gameScreen) {
    gameScreen.style.setProperty("--bubble-color", color);
  }
}


/* =====================================================
   セリフ表示
===================================================== */

function showDialogue(text) {

  dialogueBox.style.display = "block";
  textElement.textContent = "";

  fullText = text;
  currentLineCount = calculateLineCount(text);

  startTyping(text);
}


/* =====================================================
   行数計算
===================================================== */

function calculateLineCount(text) {

  const explicitLines = text.split("\n");

  return Math.min(3, Math.max(1, explicitLines.length));
}


/* =====================================================
   タイプライター
===================================================== */

function startTyping(text) {

  stopTyping();

  isTyping = true;

  let index = 0;

  const chars = Array.from(text);

  const duration = Math.max(1000, currentLineCount * 1000);

  const interval = Math.max(
    20,
    Math.floor(duration / Math.max(chars.length, 1))
  );

  typingTimer = setInterval(() => {

    if (index >= chars.length) {
      stopTyping();
      return;
    }

    textElement.textContent += chars[index];
    index++;

  }, interval);
}


/* =====================================================
   タイプライター停止
===================================================== */

function stopTyping() {

  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  if (isTyping) {
    isTyping = false;
    textElement.textContent = fullText;
  }
}


/* =====================================================
   セリフ欄タップ
===================================================== */

dialogueBox.addEventListener("click", event => {

  event.stopPropagation();

  if (isPlayingCut) {
    return;
  }

  if (isTyping) {
    stopTyping();
    return;
  }

  unlockTalker();
  runNextCommand();
});


/* =====================================================
   キャラクター解放
===================================================== */

function unlockTalker() {

  if (!state.talker) {
    return;
  }

  if (!state.unlockedCharacters.includes(state.talker)) {
    state.unlockedCharacters.push(state.talker);
  }
}


/* =====================================================
   選択肢
===================================================== */

function showChoices(command) {

  const choices = command.choices;
  const branches = command.branches || {};

  choicesContainer.innerHTML = "";
  choicesContainer.style.display = "flex";

  choices.forEach(choice => {

    const button = document.createElement("button");

    button.className = "choiceButton";
    button.textContent = choice.text;

    button.addEventListener("click", async event => {

      event.stopPropagation();

      await handleChoiceSave(choice);

      if (choice.target) {
        await loadScenarioFile(choice.target);
        return;
      }

      clearChoices();
      saveProgress();

      const branchCommands = branches[String(choice.number)];

      if (branchCommands && branchCommands.length) {
        startBranch(branchCommands);
        return;
      }

      runNextCommand();
    });

    choicesContainer.appendChild(button);
  });

  saveProgress();
}


/* =====================================================
   選択肢を消す
===================================================== */

function clearChoices() {
  choicesContainer.innerHTML = "";
  choicesContainer.style.display = "none";
}


/* =====================================================
   次のファイルボタン
===================================================== */

function showNextFile(fileName) {

  nextFileButton.style.display = "block";
  nextFileText.textContent = "次の話へ";

  nextFileButton.onclick = async event => {

    event.stopPropagation();

    saveProgress();

    startEpisode(fileName);
  };
}


/* =====================================================
   話数タイトル画面
   ファイル名の数字から話数を取り出し、
   ピンク背景に大きく「第◯話」と表示してから
   該当ファイルを読み込む。
===================================================== */

function extractEpisodeNumber(fileName) {

  const match = fileName.match(/(\d+)/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function startEpisode(fileName) {

  if (!episodeTitleScreen) {
    loadScenarioFile(fileName);
    return;
  }

  const episodeNumber = extractEpisodeNumber(fileName);

  if (episodeTitleText) {
    episodeTitleText.textContent =
      episodeNumber !== null
        ? `第${episodeNumber}話`
        : "";
  }

  episodeTitleScreen.style.display = "flex";

  setTimeout(() => {

    episodeTitleScreen.style.display = "none";

    loadScenarioFile(fileName);

  }, 1800);
}


/* =====================================================
   次のファイルボタンを消す
===================================================== */

function hideNextFile() {
  nextFileButton.style.display = "none";
}


/* =====================================================
   ファイル終了
===================================================== */

function showEndOfFile() {

  hideNextFile();
  clearChoices();
  unlockTalker();
  saveProgress();

  textElement.textContent = "";
  nameElement.textContent = "";
}


/* =====================================================
   カット演出
===================================================== */

function playCut(name = "通常") {

  if (!cutScreen) {
    console.error("cutScreen が見つかりません");
    runNextCommand();
    return;
  }

  const image = cuts[name] || cuts["通常"];

  if (!image) {
    console.error("カット画像が登録されていません:", name);
    runNextCommand();
    return;
  }

  isPlayingCut = true;

  stopTyping();
  clearChoices();
  hideNextFile();

  cutScreen.style.backgroundImage = `url("${image}")`;
  cutScreen.style.display = "flex";

  setTimeout(() => {

    cutScreen.style.display = "none";
    isPlayingCut = false;

    runNextCommand();

  }, 1500);
}


/* =====================================================
   スキップ
===================================================== */

skipButton.addEventListener("click", event => {

  event.stopPropagation();

  if (isPlayingCut) {
    return;
  }

  stopTyping();

  while (commandIndex < commands.length) {

    const command = commands[commandIndex];
    commandIndex++;

    if (command.type === "cut") {
      playCut(command.name);
      return;
    }

    if (command.type === "choice") {
      showChoices(command);
      return;
    }

    if (command.type === "file") {
      showNextFile(command.value);
      return;
    }

    state = applyCommand(command, state);

    if (command.type === "b") {
      updateBackground();
    }

    if (command.type === "c") {
      renderCharacters();
    }

    if (command.type === "t") {
      updateName();
    }

    if (command.type === "s") {
      textElement.textContent = state.text;
      fullText = state.text;
      unlockTalker();
    }
  }

  saveProgress();
  finishCommands();
});


/* =====================================================
   メニュー
===================================================== */

menuButton.addEventListener("click", event => {
  event.stopPropagation();
  openMenu();
});

function openMenu() {
  alert(
    "メニュー\n\n" +
    "キャラクター図鑑は characters.html から開けます。"
  );
}


/* =====================================================
   キャラクター図鑑
===================================================== */

characterButton.addEventListener("click", event => {
  event.stopPropagation();
  location.href = "characters.html";
});


/* =====================================================
   セーブ
===================================================== */

function saveProgress() {

  saveState({
    file: currentFile,
    index: commandIndex,
    unlockedCharacters: state.unlockedCharacters,
    choices: state.choices
  });
}


/* =====================================================
   選択肢保存
===================================================== */

async function handleChoiceSave(choice) {

  saveProgress();

  console.log("選択肢:", choice.text);
}


/* =====================================================
   初期化
   ※修正点: このスコープをここでしっかり閉じ、
   showStoryStartTitle をこの関数の外に出した。
===================================================== */

async function initializeGame() {

  const saved = loadSave();

  if (saved && saved.file) {

    const shouldResume = confirm("前回の続きから始めますか？");

    if (shouldResume) {

      state.unlockedCharacters = saved.unlockedCharacters || [];
      state.choices = saved.choices || {};

      await loadScenarioFile(saved.file, saved.index || 0);

      return;
    }

    clearSave();
  }

  state.unlockedCharacters = [];
  state.choices = {};

  await loadScenarioFile("opening.js");
}


/* =====================================================
   学園生活スタート画面
   ※修正点: 引数 nextFile を受け取り、
   固定で "opening.js" に戻らないようにした。
   トップレベルの関数にしたことで、
   runNextCommand から正しく参照できる。
===================================================== */

function showStoryStartTitle(nextFile) {

  if (!storyStartScreen) {
    loadScenarioFile(nextFile);
    return;
  }

  const image = backgrounds["教室前"];

  if (image) {
    storyStartScreen.style.backgroundImage = `url("${image}")`;
  }

  storyStartScreen.style.display = "flex";

  setTimeout(() => {

    storyStartScreen.style.display = "none";

    startEpisode(nextFile);

  }, 1800);
}


/* =====================================================
   開始
   ※修正点: initializeGame の内側で
   自分自身を再帰呼び出ししていたのを削除し、
   ここでの1回だけの呼び出しにした。
===================================================== */

initializeGame();