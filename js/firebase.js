/* =====================================================
   Firebase
===================================================== */

import {
  initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getAuth
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =====================================================
   Firebase設定
===================================================== */

const firebaseConfig = {

  apiKey:
    "ここにあなたのapiKey",

  authDomain:
    "ここにあなたのauthDomain",

  databaseURL:
    "ここにあなたのdatabaseURL",

  projectId:
    "ここにあなたのprojectId",

  storageBucket:
    "ここにあなたのstorageBucket",

  messagingSenderId:
    "ここにあなたのmessagingSenderId",

  appId:
    "ここにあなたのappId"

};


/* =====================================================
   初期化
===================================================== */

const app =
  initializeApp(
    firebaseConfig
  );


export const db =
  getDatabase(app);


export const auth =
  getAuth(app);