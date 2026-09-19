/* =====================================================
   シナリオエンジン
===================================================== */


/* =====================================================
   キャラクター指定
===================================================== */

function parseCharacter(value) {

  const text = String(value || "").trim();

  const separator = text.indexOf("-");

  if (separator === -1) {
    return { name: text, expression: "通常" };
  }

  return {
    name: text.slice(0, separator),
    expression: text.slice(separator + 1)
  };
}


/* =====================================================
   1行を通常コマンドとして解析
   (b= / c= / t= / s= / file= / cut / cut=)
===================================================== */

function parseSimpleLine(line) {

  if (line === "cut") {
    return { type: "cut", name: "通常" };
  }

  if (line.startsWith("cut=")) {
    const cutName = line.slice(4).trim();
    return { type: "cut", name: cutName || "通常" };
  }

  const match = line.match(/^([a-zA-Z]+)\s*=(.*)$/);

  if (!match) {
    return null;
  }

  const key = match[1].toLowerCase();
  const value = match[2].trim();

  return { type: key, value: value };
}


/* =====================================================
   選択肢ブロック
   q=
   1:テキスト
   2:テキスト -> 別ファイル.js
===================================================== */

function parseChoiceBlock(lines, startIndex) {

  let i = startIndex;
  const choices = [];

  while (i < lines.length) {

    const choiceLine = lines[i].trim();

    if (!choiceLine) {
      i++;
      continue;
    }

    const match = choiceLine.match(/^(\d+)\s*:\s*(.*)$/);

    if (!match) {
      break;
    }

    const number = Number(match[1]);
    const value = match[2].trim();
    const parts = value.split(/\s*->\s*/);

    choices.push({
      number: number,
      text: parts[0].trim(),
      target: parts[1] ? parts[1].trim() : null
    });

    i++;
  }

  return { choices, nextIndex: i };
}


/* =====================================================
   選択肢直後の「同ファイル内分岐」

   1
   c=柳
   t=柳
   s=どうしたの？

   2
   c=
   s=そのまま帰った。


   のように、番号だけの行(ラベル)から
   始まる分岐ブロックを取り出す。

   ブロック同士の間は空行1つ、
   分岐全体の終わり(共通処理への復帰点)は
   空行2つ、または番号ラベルではない行で判定する。
===================================================== */

function parseBranches(lines, startIndex, validNumbers) {

  let i = startIndex;
  const branches = {};

  while (i < lines.length) {

    /* 空行を読み飛ばす。空行が連続したらここで終了 */

    while (i < lines.length && !lines[i].trim()) {

      i++;

      if (i < lines.length && !lines[i].trim()) {
        return { branches, nextIndex: i };
      }
    }

    if (i >= lines.length) {
      break;
    }

    const labelLine = lines[i].trim();
    const labelMatch = labelLine.match(/^(\d+)$/);

    if (
      !labelMatch ||
      !validNumbers.includes(Number(labelMatch[1]))
    ) {

      /*
        番号ラベルではない行に到達
        → ここから先は共通の続きの処理
      */

      return { branches, nextIndex: i };
    }

    const branchNumber = labelMatch[1];

    i++;

    const branchCommands = [];

    while (i < lines.length && lines[i].trim()) {

      const line = lines[i].trim();
      const command = parseSimpleLine(line);

      if (command) {
        branchCommands.push(command);
      }

      i++;
    }

    branches[branchNumber] = branchCommands;
  }

  return { branches, nextIndex: i };
}


/* =====================================================
   シナリオ解析
===================================================== */

export function parseScenario(raw) {

  const lines =
    String(raw || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");

  const commands = [];

  let i = 0;

  while (i < lines.length) {

    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    /* -----------------------------------------------
       選択肢(+同ファイル内分岐)
    ----------------------------------------------- */

    if (line === "q=") {

      const {
        choices,
        nextIndex
      } = parseChoiceBlock(lines, i + 1);

      const validNumbers =
        choices.map(choice => choice.number);

      const {
        branches,
        nextIndex: afterBranches
      } = parseBranches(lines, nextIndex, validNumbers);

      commands.push({
        type: "choice",
        choices: choices,
        branches: branches
      });

      i = afterBranches;
      continue;
    }

    /* -----------------------------------------------
       カット
    ----------------------------------------------- */

    if (line === "cut" || line.startsWith("cut=")) {

      commands.push(parseSimpleLine(line));

      i++;
      continue;
    }

    /* -----------------------------------------------
       通常コマンド
       b= / c= / t= / s= / file=
    ----------------------------------------------- */

    const command = parseSimpleLine(line);

    if (command) {
      commands.push(command);
    }

    i++;
  }

  console.log("解析されたシナリオ:", commands);

  return commands;
}


/* =====================================================
   コマンドを状態へ反映
===================================================== */

export function applyCommand(command, state) {

  const nextState = {

    ...state,

    visibleCharacters:
      Array.isArray(state.visibleCharacters)
        ? [...state.visibleCharacters]
        : [],

    unlockedCharacters:
      Array.isArray(state.unlockedCharacters)
        ? [...state.unlockedCharacters]
        : [],

    choices:
      state.choices
        ? { ...state.choices }
        : {}
  };

  /* 背景 */

  if (command.type === "b") {
    nextState.background = command.value;
    return nextState;
  }

  /* キャラクター */

  if (command.type === "c") {

    if (!command.value) {
      nextState.visibleCharacters = [];
      return nextState;
    }

    const character = parseCharacter(command.value);

    nextState.visibleCharacters = [
      {
        name: character.name,
        expression: character.expression,
        position: "center"
      }
    ];

    return nextState;
  }

  /* 話者 */

  if (command.type === "t") {
    nextState.talker = command.value;
    return nextState;
  }

  /* セリフ */

  if (command.type === "s") {
    nextState.text = command.value.replace(/\\n/g, "\n");
    return nextState;
  }

  return nextState;
}


/* =====================================================
   キャラクター解析を公開
===================================================== */

export { parseCharacter };