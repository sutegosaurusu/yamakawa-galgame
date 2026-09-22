/* =====================================================
   山川ドキドキ！恋愛シミュレーションゲーム
   メニュー
===================================================== */


import {

  loadCloudSave,
  loadSave

} from "./js/save.js";


import {

  characters

} from "./js/characters.js";


/* =====================================================
   DOM
===================================================== */

const characterList =
  document.getElementById(
    "characterList"
  );


const progressText =
  document.getElementById(
    "progressText"
  );


const progressFill =
  document.getElementById(
    "progressFill"
  );


const progressPercent =
  document.getElementById(
    "progressPercent"
  );


const backButton =
  document.getElementById(
    "backButton"
  );


/* =====================================================
   キャラクター表示
===================================================== */

function renderCharacters(
  affectionData
) {

  characterList.innerHTML =
    "";


  for (
    const characterId
    in characters
  ) {

    const character =
      characters[
        characterId
      ];


    /*
      affection: true
      のキャラクターだけ表示
    */

    if (
      character.affection !== true
    ) {

      continue;

    }


    const affection =
      Math.max(

        0,

        Math.min(

          100,

          Number(
            affectionData[
              character.id
            ] || 0
          )

        )

      );


    /* =====================================
       カード
    ====================================== */

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "characterCard";


    /* =====================================
       名前
    ====================================== */

    const name =
      document.createElement(
        "div"
      );

    name.className =
      "characterName";

    name.textContent =
      character.name;


    /* =====================================
       メーター
    ====================================== */

    const meter =
      document.createElement(
        "div"
      );

    meter.className =
      "affectionMeter";


    const fill =
      document.createElement(
        "div"
      );

    fill.className =
      "affectionFill";


    fill.style.height =
      affection + "%";


    meter.appendChild(
      fill
    );


    /* =====================================
       数値
    ====================================== */

    const value =
      document.createElement(
        "div"
      );

    value.className =
      "affectionValue";

    value.textContent =
      affection +
      " / 100";


    /* =====================================
       追加
    ====================================== */

    card.appendChild(
      name
    );

    card.appendChild(
      meter
    );

    card.appendChild(
      value
    );


    characterList.appendChild(
      card
    );

  }

}


/* =====================================================
   進行状況表示
===================================================== */

function renderProgress(
  save
) {

  /*
    保存データがない場合
  */

  if (
    !save ||
    !save.file
  ) {

    progressText.textContent =
      "まだゲームを開始していません。";

    progressFill.style.width =
      "0%";

    progressPercent.textContent =
      "0%";

    return;

  }


  const index =
    Number(
      save.index || 0
    );


  const total =
    Number(
      save.total || 0
    );


  let percent = 0;


  if (
    total > 0
  ) {

    percent =

      Math.floor(

        (
          index /
          total
        ) * 100

      );

  }


  percent =
    Math.max(

      0,

      Math.min(
        100,
        percent
      )

    );


  progressText.textContent =

    "現在：" +
    save.file +
    "　" +
    index +
    " / " +
    total;


  progressFill.style.width =
    percent + "%";


  progressPercent.textContent =
    percent + "%";

}


/* =====================================================
   メニュー初期化
===================================================== */

async function initializeMenu() {

  try {

    /*
      Firebaseを優先
    */

    let save =
      await loadCloudSave();


    /*
      Firebaseにデータがまだない場合は
      localStorageを使用
    */

    if (
      !save
    ) {

      save =
        loadSave();

    }


    const affection =
      save?.affection || {};


    renderCharacters(
      affection
    );


    renderProgress(
      save
    );


  } catch (
    error
  ) {

    console.error(
      "メニュー読み込みエラー:",
      error
    );


    progressText.textContent =
      "ゲームデータを読み込めませんでした。";

  }

}


/* =====================================================
   ゲームへ戻る
===================================================== */

backButton.addEventListener(
  "click",
  () => {

    location.href =
      "scenario.html";

  }
);


/* =====================================================
   開始
===================================================== */

initializeMenu();