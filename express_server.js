const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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

//Our version of a DB
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//npm module responsible for decrypting the buffer sent in the body of the request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------- ROUTES (DOWN)-----------------//

//List of potential routes that the server listens to:
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  const templateVars = { shortURL: shortURL, longURL: longURL };

  if (!longURL) {
    return res.status(404).send("Sorry, this resource is not available");
  }
  res.render("urls_show.ejs", templateVars);
});

// ------------------ ROUTES (UP)------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
