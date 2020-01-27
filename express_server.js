const express = require("express");
const {
  getUserByEmail,
  isLoggedIn,
  generateRandomString,
  urlsForUser
} = require("./helpers");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(
  cookieSession({
    name: "session",
    keys: ["a", "b", "c"]
  })
);
const bcrypt = require("bcrypt");

//Password Encryption
const saltRounds = 10;
const plainTextPassword1 = "purple-monkey-dinosaur";
const plainTextPassword2 = "dishwasher-funk";
const hashedPassword1 = bcrypt.hashSync(plainTextPassword1, saltRounds);
const hashedPassword2 = bcrypt.hashSync(plainTextPassword2, saltRounds);

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "3rQmlu": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword1
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword2
  }
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    res.redirect("/urls");
  }
  res.render("urls_login.ejs");
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(users, req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.send(`Incorrect password for ${req.body.email}. (Error code: 403)`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register.ejs");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.send("Please enter both an email and password. (Error Code: 400");
  } else if (getUserByEmail(users, req.body.email)) {
    res.send("Email is already registered. Please login (Error Code: 400");
  } else {
    let id = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[id] = {
      id: id,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    const userURLS = urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = {
      urls: userURLS,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
    // Only logged in users can access the URL Page, and only those logged in users can see their own URLS. Do not want to put an error message here as URLS is the main page.
  }
});

app.post("/urls", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    const randomStr = generateRandomString();
    urlDatabase[randomStr] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${randomStr}`);
  } else {
    res.send(
      "Only logged-in users can create new links. Please login or register"
    );
  }
});

app.get("/urls/new", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    const userURLS = urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = {
      urls: userURLS,
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL:
        urlDatabase[req.params.shortURL] &&
        urlDatabase[req.params.shortURL]["longURL"],
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(401);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("Only logged in users can delete links. Please login.");
  }
  if (isLoggedIn(users, req.session)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("You do not own this URL, therefore you cannot delete it.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/u/:id", (req, res) => {
  const urls = urlDatabase[req.params.userID];
  res.redirect("/urls", urls);
});

app.post("/urls/:id", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("Only logged-in users can create a URL! Please login or register");
  }
});

//catch all route
app.get("*", (req, res) => {
  res.redirect("/urls");
});

//Server ON message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  isLoggedIn,
  urlsForUser
};
