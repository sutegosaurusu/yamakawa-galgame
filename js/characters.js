/* =====================================================
   キャラクター設定
===================================================== */

export const characters = {


  /* ===================================================
     山川
  =================================================== */

  山川: {

    id: "山川",

    name: "山川",

    color: "#b9dcff",

    images: {

      /* c=山川 */
      "通常":
        "images/characters/yamakawa-1.png",

      /* c=山川-1 */
      "1":
        "images/characters/yamakawa-1.png",

      /* c=山川-1hap */
      "1hap":
        "images/characters/yamakawa-1hap.png",

      /* c=山川-1dis */
      "1dis":
        "images/characters/yamakawa-1dis.png",

      /* c=山川-1igi */
      "1igi":
        "images/characters/yamakawa-1igi.png",

      /* c=山川-1ki */
      "1ki":
        "images/characters/yamakawa-1ki.png",

      /* c=山川-1mis */
      "1mis":
        "images/characters/yamakawa-1mis.png",

      /* c=山川-1sur */
      "1sur":
        "images/characters/yamakawa-1sur.png",

      /* c=山川-2 */
      "2":
        "images/characters/yamakawa-2.png",

      /* c=山川-2hap */
      "2hap":
        "images/characters/yamakawa-2hap.png",

      /* c=山川-3 */
      "3":
        "images/characters/yamakawa-3.png",

      /* c=山川-4 */
      "4":
        "images/characters/yamakawa-4.png",

      /* c=山川-4dis */
      "4dis":
        "images/characters/yamakawa-4dis.png",

      /* c=山川-4hap */
      "4hap":
        "images/characters/yamakawa-4hap.png",

      /* c=山川-4igi */
      "4igi":
        "images/characters/yamakawa-4igi.png",

      /* c=山川-4iri */
      "4iri":
        "images/characters/yamakawa-4iri.png",

      /* c=山川-4ki */
      "4ki":
        "images/characters/yamakawa-4ki.png",

      /* c=山川-4mis */
      "4mis":
        "images/characters/yamakawa-4mis.png",

      /* c=山川-4wet */
      "4wet":
        "images/characters/yamakawa-4wet.png",

      /* c=山川-da */
      "da":
        "images/characters/yamakawa-da.png"
    }
  },


  /* ===================================================
     柳
  =================================================== */

  柳: {

    id: "柳",

    name: "柳",

    color: "#ffc1da",

    images: {

      /* c=柳 */
      "通常":
        "images/characters/yanagi-1.png",

      /* c=柳-1 */
      "1":
        "images/characters/yanagi-1.png",

      /* c=柳-1dis */
      "1dis":
        "images/characters/yanagi-1dis.png",

      /* c=柳-1hap */
      "1hap":
        "images/characters/yanagi-1hap.png",

      /* c=柳-1iri */
      "1iri":
        "images/characters/yanagi-1iri.png",

      /* c=柳-1ki */
      "1ki":
        "images/characters/yanagi-1ki.png",

      /* c=柳-1mis */
      "1mis":
        "images/characters/yanagi-1mis.png",

      /* c=柳-1wet */
      "1wet":
        "images/characters/yanagi-1wet.png",

      /* c=柳-1wiff */
      "1wiff":
        "images/characters/yanagi-1wiff.png",

      /* c=柳-2 */
      "2":
        "images/characters/yanagi-2.png",

      /* c=柳-3 */
      "3":
        "images/characters/yanagi-3.png",

      /* c=柳-3dis */
      "3dis":
        "images/characters/yanagi-3dis.png",

      /* c=柳-3hap */
      "3hap":
        "images/characters/yanagi-3hap.png",

      /* c=柳-3ki */
      "3ki":
        "images/characters/yanagi-3ki.png",

      /* c=柳-3mis */
      "3mis":
        "images/characters/yanagi-3mis.png",

      /* c=柳-4 */
      "4":
        "images/characters/yanagi-4.png",

      /* c=柳-4hap */
      "4hap":
        "images/characters/yanagi-4hap.png",

      /* c=柳-5dis */
      "5dis":
        "images/characters/yanagi-5dis.png",

      /* c=柳-5hap */
      "5hap":
        "images/characters/yanagi-5hap.png",

      /* c=柳-5igi */
      "5igi":
        "images/characters/yanagi-5igi.png",

      /* c=柳-5iri */
      "5iri":
        "images/characters/yanagi-5iri.png"
    }
  },


  /* ===================================================
     中野
  =================================================== */

  中野: {

    id: "中野",

    name: "中野",

    color: "#d8c6ff",

    images: {

      /* c=中野 */
      "通常":
        "images/characters/nakano-1.png",

      /* c=中野-1 */
      "1":
        "images/characters/nakano-1.png",

      /* c=中野-1dis */
      "1dis":
        "images/characters/nakano-1dis.png",

      /* c=中野-1hap */
      "1hap":
        "images/characters/nakano-1hap.png",

      /* c=中野-1iri */
      "1iri":
        "images/characters/nakano-1iri.png",

      /* c=中野-1mis */
      "1mis":
        "images/characters/nakano-1mis.png",

      /* c=中野-1wet */
      "1wet":
        "images/characters/nakano-1wet.png",

      /* c=中野-2 */
      "2":
        "images/characters/nakano-2.png",

      /* c=中野-3 */
      "3":
        "images/characters/nakano-3.png",

      /* c=中野-4 */
      "4":
        "images/characters/nakano-4.png"
    }
  }

};


/* =====================================================
   キャラクター取得
===================================================== */

export function getCharacter(name) {

  return (
    characters[name] ||
    null
  );

}


/* =====================================================
   立ち絵取得

   例：

   getCharacterImage("山川", "1hap")

   ↓

   images/characters/yamakawa-1hap.png
===================================================== */

export function getCharacterImage(
  name,
  expression = "通常"
) {

  const character =
    getCharacter(name);


  if (!character) {

    console.warn(
      "キャラクターが登録されていません:",
      name
    );

    return null;
  }


  return (
    character.images[expression] ||
    character.images["通常"] ||
    null
  );

}


/* =====================================================
   吹き出しカラー取得
===================================================== */

export function getCharacterColor(name) {

  const character =
    getCharacter(name);


  if (!character) {

    return "#ffffff";

  }


  return (
    character.color ||
    "#ffffff"
  );

}