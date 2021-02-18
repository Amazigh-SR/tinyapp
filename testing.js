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

//A function that works exactly like verifyDB but instead returns the associated userID
//It is also flexblie as it can search any key for e.g.ValueType --> Email, pw or userID; value --> Actual value;
const returnUserID = function(valueType, value, db) {
  for (const userID in db) {
    if (db[userID][valueType] === value) {
      return userID;
    }
  }
  return false;
};
