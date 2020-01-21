

const randomatic = require("randomatic");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

function generateRandomString() {
return randomatic('aA0', 6);
}


app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  //Log the POST request body to the console
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL
  res.redirect(`/urls/${randomStr}`); 
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
