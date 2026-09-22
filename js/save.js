/* =====================================================
   山川ドキドキ！恋愛シミュレーションゲーム
   セーブ管理
   localStorage + Firebase
===================================================== */


import {

  ref,
  get,
  update,
  remove

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


import {

  signInAnonymously

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

  db,
  auth

} from "./firebase.js";


/* =====================================================
   localStorage
===================================================== */

const LOCAL_SAVE_KEY =
  "yamakawaGameSave";


/* =====================================================
   初期好感度
===================================================== */

export const DEFAULT_AFFECTION = {

  "けんご": 0,

  "中野": 0,

  "柳": 0

};


/* =====================================================
   匿名ログイン
===================================================== */

let authPromise = null;


async function ensureAuth() {

  if (auth.currentUser) {

    return auth.currentUser;

  }


  if (!authPromise) {

    authPromise =
      signInAnonymously(
        auth
      );

  }


  const credential =
    await authPromise;


  return credential.user;

}


/* =====================================================
   Firebase保存場所
===================================================== */

async function getSaveRef() {

  const user =
    await ensureAuth();


  return ref(

    db,

    "gameSaves/" +
    user.uid

  );

}


/* =====================================================
   ローカル保存
===================================================== */

export function loadSave() {

  try {

    const raw =
      localStorage.getItem(
        LOCAL_SAVE_KEY
      );


    if (!raw) {

      return null;

    }


    return JSON.parse(
      raw
    );

  } catch (error) {

    console.error(
      "localStorage読み込みエラー:",
      error
    );

    return null;

  }

}


/* =====================================================
   Firebase保存
===================================================== */

async function saveCloud(
  data
) {

  try {

    const saveRef =
      await getSaveRef();


    const updates = {};


    /* 進行状況 */

    if (
      data.file !== undefined ||
      data.index !== undefined ||
      data.total !== undefined
    ) {

      updates.progress = {

        file:
          data.file ||
          "opening.js",

        index:
          Number(
            data.index || 0
          ),

        total:
          Number(
            data.total || 0
          )

      };

    }


    /* 好感度 */

    if (
      data.affection
    ) {

      updates.affection =
        data.affection;

    }


    /* 解放キャラクター */

    if (
      data.unlockedCharacters
    ) {

      updates.unlockedCharacters =
        data.unlockedCharacters;

    }


    /* 選択肢 */

    if (
      data.choices
    ) {

      updates.choices =
        data.choices;

    }


    await update(
      saveRef,
      updates
    );


    console.log(
      "Firebaseに保存しました"
    );


  } catch (error) {

    console.error(
      "Firebase保存エラー:",
      error
    );

  }

}


/* =====================================================
   保存
   既存game.jsから使っているsaveState()を維持
===================================================== */

export function saveState(
  data
) {

  /* localStorage */

  try {

    localStorage.setItem(

      LOCAL_SAVE_KEY,

      JSON.stringify(
        data
      )

    );

  } catch (error) {

    console.error(
      "localStorage保存エラー:",
      error
    );

  }


  /* Firebase */

  saveCloud(
    data
  );

}


/* =====================================================
   Firebaseから読み込み
===================================================== */

export async function loadCloudSave() {

  try {

    const saveRef =
      await getSaveRef();


    const snapshot =
      await get(
        saveRef
      );


    if (
      !snapshot.exists()
    ) {

      return null;

    }


    const data =
      snapshot.val() || {};


    return {

      file:
        data.progress?.file ||
        null,

      index:
        Number(
          data.progress?.index ||
          0
        ),

      total:
        Number(
          data.progress?.total ||
          0
        ),

      affection: {

        ...DEFAULT_AFFECTION,

        ...(data.affection || {})

      },

      unlockedCharacters:
        data.unlockedCharacters ||
        [],

      choices:
        data.choices ||
        {}

    };


  } catch (error) {

    console.error(
      "Firebase読み込みエラー:",
      error
    );

    return null;

  }

}


/* =====================================================
   好感度変更
===================================================== */

export async function changeAffection(

  characterId,

  amount

) {

  const data =
    await loadCloudSave();


  const current =
    Number(
      data?.affection?.[characterId] ||
      0
    );


  const next =
    Math.max(

      0,

      Math.min(

        100,

        current +
        Number(
          amount || 0
        )

      )

    );


  try {

    const saveRef =
      await getSaveRef();


    await update(

      saveRef,

      {

        affection: {

          ...(data?.affection || DEFAULT_AFFECTION),

          [characterId]:
            next

        }

      }

    );


    return next;


  } catch (error) {

    console.error(
      "好感度保存エラー:",
      error
    );


    return current;

  }

}


/* =====================================================
   好感度取得
===================================================== */

export async function getAffection(
  characterId
) {

  const data =
    await loadCloudSave();


  return Number(

    data?.affection?.[characterId] ||
    0

  );

}


/* =====================================================
   セーブ削除
===================================================== */

export async function clearSave() {

  /* localStorage */

  localStorage.removeItem(
    LOCAL_SAVE_KEY
  );


  /* Firebase */

  try {

    const saveRef =
      await getSaveRef();


    await remove(
      saveRef
    );


  } catch (error) {

    console.error(
      "Firebaseセーブ削除エラー:",
      error
    );

  }

}