const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");
const PORT = 8080;

// ------------------- Middlewares (BELOW)-------------------//

//Setting the default view engine to ejs
app.set("view engine", "ejs");
//npm module responsible for decrypting the buffer sent in the body of the request
app.use(bodyParser.urlencoded({ extended: true }));
//middleware cookieSession - For setting & manipulating envrypted cookies
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

// -------------------- ROUTES (BELOW)--------------------//
//List of potential routes that the server listens to:

// ----------------- POST ROUTES (BELOW)-----------------//
app.post("/urls", (req, res) => {
  const userID = users[req.session.userID];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  //If the email or password fields are empty, notify the user
  if (!email || !password) {
    return res.status(400).send("Invalid email address or password");
  }
  //If email already exsists, notify the user
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }

  //otherwise push the new user to the DB and set a cookie
  const user = generateRandomString(6);
  users[user] = { email, password: bcrypt.hashSync(password, 10), id: user };
  req.session.userID = user;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = users[req.session.userID];
  const shortURL = req.params.shortURL;
  //If the owner of this shortURL is not logged in then adios to the login page
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).redirect("/login");
  }
  //else delete shortURL property then redirect to homepage
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = users[req.session.userID];
  const shortURL = req.params.shortURL;
  //If the owner of this shortURL is not logged in then adios to the login page
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).redirect("/login");
  }
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //Clear the cookie
  req.session.userID = null;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //If email is not present in the users DB then 403.
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("Sorry, this email is not valid");
  }

  //If email exists then verify that both the email and password are from the same user
  const userID = getUserByEmail(email, users);
  if (bcrypt.compareSync(password, users[userID].password)) {
    req.session.userID = userID;
    res.redirect("/urls");
    //else return wrong password
  } else {
    return res.status(403).send("Sorry, this password is not valid");
  }
});

// ----------------- GET ROUTES (BELOW)-----------------//
app.get("/login", (req, res) => {
  const userID = users[req.session.userID];
  const templateVars = { userID };
  res.render("urls_login.ejs", templateVars);
});

app.get("/register", (req, res) => {
  const userID = users[req.session.userID];
  const templateVars = { userID };
  res.render("urls_registration.ejs", templateVars);
});

app.get("/", (req, res) => {
  const userID = users[req.session.userID];
  if (userID) {
    return res.status(302).redirect("/urls");
  } else {
    return res.status(302).redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  const userID = users[req.session.userID];
  if (!userID) {
    return res.redirect("/login");
  }
  const templateVars = {
    userID,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const userID = users[req.session.userID];
  //If the user is not logged in or registered then redirect to the login page
  if (!userID) {
    return res.status(403).redirect("/login");
  }
  //else give access to the page
  const personalLinks = urlsForUser(urlDatabase, userID);
  const templateVars = {
    urls: personalLinks,
    userID,
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //if shortURL does not exsist then
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Sorry, this resource is not available");
  } //else redirect to longURL
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = users[req.session.userID];
  const shortURL = req.params.shortURL;
  //Added restrictions to deal with users not loggedin that are trying to view a link not theirs
  if (!userID) {
    return res.status(403).redirect("/login");
  }
  //If a loggedin user is asking for a resource that does not exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Sorry, this resource is not available");
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).redirect("/login");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    userID,
  };

  res.render("urls_show.ejs", templateVars);
});

// ------------------ Server Listens on PORT 8080 (BELOW)------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
