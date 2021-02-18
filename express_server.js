const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

//Setting the default view engine to ejs
app.set("view engine", "ejs");
//npm module responsible for decrypting the buffer sent in the body of the request
app.use(bodyParser.urlencoded({ extended: true }));
//middleware cookieParser - similar to bodyParser but for cookies
app.use(cookieParser());

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

//A function that will check if an id/email/password already exists in the database
//ValueType --> Email, pw or userID; value --> Actual value;
const verifyDB = function(valueType, value, db) {
  for (const userID in db) {
    if (db[userID][valueType] === value) {
      return true;
    }
  }
  return false;
};

// -------------------- DataBases (BELOW)--------------------//
//Our version of a users DB
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

//Our version of a shortURL DB
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// -------------------- ROUTES (BELOW)--------------------//
//List of potential routes that the server listens to:

// ----------------- POST ROUTES (BELOW)-----------------//
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  //If the email or password fields are empty, notify the user
  if (!email || !password) {
    return res.status(400).send("Invalid email address or password");
  }
  //If email already exsists, notify the user
  if (verifyDB("email", email, users)) {
    return res.status(400).send("Email already exists");
  }

  //otherwise push the new user to the DB and set a cookie
  const user = generateRandomString(6);
  users[user] = { email, password, id: user };
  res.cookie("userID", user);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//Need to consider the edge case where username is submited without a value
app.post("/login", (req, res) => {
  // const userName = req.body.username;
  // res.cookie("username", userName);
  res.redirect("/urls");
});

// ----------------- GET ROUTES (BELOW)-----------------//
app.get("/login", (req, res) => {
  res.render("urls_login.ejs");
});

app.get("/register", (req, res) => {
  res.render("urls_registration.ejs");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const userID = users[req.cookies["userID"]];

  const templateVars = {
    userID,
  }; // <-- Added cookie variable here
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const userID = users[req.cookies["userID"]];
  const templateVars = {
    urls: urlDatabase,
    userID,
  }; // <-- Added cookie variable here
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userID = users[req.cookies["userID"]];
  const templateVars = {
    shortURL,
    longURL,
    userID,
    // <-- Added cookie variable here
  };

  if (!longURL) {
    return res.status(404).send("Sorry, this resource is not available");
  }
  res.render("urls_show.ejs", templateVars);
});

// ------------------ Server Listens on PORT 8080 (BELOW)------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
