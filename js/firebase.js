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
    "AIzaSyApv0E9G3ectx2bpZHjRvUtH6M8dwxs5oI",

  authDomain:
    "yamakawa-galgame.firebaseapp.com",

  databaseURL:
    "https://yamakawa-galgame-default-rtdb.firebaseio.com",

  projectId:
    "yamakawa-galgame",

  storageBucket:
    "yamakawa-galgame.firebasestorage.app",

  messagingSenderId:
    "836080494904",

  appId:
    "1:836080494904:web:5261ac38f02949737c79cd"

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