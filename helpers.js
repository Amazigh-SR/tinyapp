// ------------------ Helper Functions (BELOW)------------------//
//A function that will generate a random string of 6 random alphanumeric characters
const generateRandomString = function(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//A function that will return a userID associated to an email
const getUserByEmail = function(value, db) {
  for (const userID in db) {
    if (db[userID]["email"] === value) {
      return userID;
    }
  }
  return undefined;
};

//A function that returns all the URLs associated to a given userID
const urlsForUser = function(dbObj, userID) {
  const obj = {};
  for (const url in dbObj) {
    if (userID === dbObj[url].userID) {
      obj[url] = dbObj[url].longURL;
    }
  }
  return obj;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
