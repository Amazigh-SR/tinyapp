const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.com", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ49lW" },
  i3Boo0: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
};

const urlsForUser = function(dbObj, userID) {
  const obj = {};
  for (const url in dbObj) {
    if (userID === dbObj[url].userID) {
      obj[url] = dbObj[url].longURL;
    }
  }
  return obj;
};

console.log(urlsForUser(urlDatabase, "aJ48lW"));
