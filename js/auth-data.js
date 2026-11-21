/*
 * auth-data.js
 * ------------------------------------------------------------
 * The vault never stores the real access tokens - only a salted,
 * 20,000-round SHA-256 fingerprint of each one. Nobody can read a
 * token from this file; the login page just hashes what was typed
 * and checks whether it matches one of these fingerprints.
 *
 * `title` is the name used in the welcome window.
 */
window.VAULT = {
  salt: "7c00297660a68cf78e1cc0da1d240bf2",
  rounds: 20000,
  people: [
    { name: "Binuranga", title: "Mr. Binuranga", hash: "314f305e2f6593f864f5087a4731d24f8a41e81efe6b887930d69d56cd880a4a" },
    { name: "Detective", title: "Detective",     hash: "2a502f8caac74fdafc98bb1cf15347551a91f661686b834e97f02424b4335ed1" },
    { name: "Avishka",   title: "Avishka",       hash: "11a6cee711ee2b3405d0442674796d7b7c0d1ff0f43098e4ba85411e027d54b2" },
    { name: "Saduni",    title: "Saduni",        hash: "2763656e13dc5968c6b37a38d5fff8a4f6c30c81ecd0dfd0c1dce9088848960f" },
    { name: "Jesmi",     title: "Jesmi",         hash: "8ae1c62023d9dc369205404230eace92f95fb9e74b801a70ab306671b6f6c27e" },
    { name: "Kaveesha",  title: "Kaveesha",      hash: "16020ee80c014669f660d0b99d21f1a23e5d3eafeb2e78c0ce653c7c9487823c" }
  ]
};
