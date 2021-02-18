const users = {
  n2xsO1: {
    id: "n2xsO",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "8oL2xP": {
    id: "oL2xP",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const verifyDB = function(valueType, value, db) {
  for (const userID in db) {
    if (db[userID][valueType] === value) {
      return userID;
    }
  }
  return false;
};

console.log(verifyDB("email", "user2@example.com", users));

const returnUserID = function(valueType, value, db) {
  for (const userID in db) {
    if (db[userID][valueType] === value) {
      return userID;
    }
  }
  return false;
};
