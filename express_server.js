const randomatic = require("randomatic");
const express = require("express");
const { getUserByEmail } = require("./helpers");
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
const saltRounds = 10;
const plainTextPassword1 = "purple-monkey-dinosaur";
const plainTextPassword2 = "dishwasher-funk";
// const newUserPassword = req.body.password;
const hashedPassword1 = bcrypt.hashSync(plainTextPassword1, saltRounds);
const hashedPassword2 = bcrypt.hashSync(plainTextPassword2, saltRounds);
// const hashedPassword3 = bcrypt.hashSync(newUserPassword, saltRounds);


bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword1); // returns true

function generateRandomString() {
  return randomatic("aA0", 6); // make a random alphanumeric string of 6 characters
}

//checks if the user is currently logged in
const isLoggedIn = function(database, cookie) {
  for (const user in database) {
    if (database[user].id === cookie.user_id) {
      return true;
    }
}
return null;
};

//returns the URLS where the userID is equal to the ID of the currently logged in user
const urlsForUser = function(id) {
  let result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
       result[url] = urlDatabase[url].longURL;
    }
  }
  return result;
  
};

//APP USE AND SET TO VIEW EJS
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//DATABASES

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

//GET ENDPOINTS
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  if (isLoggedIn(users, req.session)) {
  const userURLS = urlsForUser(req.session.user_id);
  let templateVars = {
    urls: userURLS,
    user: users[req.session.user_id]
  }
  res.render("urls_index", templateVars);
} else {
  res.sendStatus(403); // Only logged in users can access the URL Page, and only those logged in users can see their own URLS
}
});


app.get("/urls/new", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    const userURLS = urlsForUser(req.session.user_id);
    let templateVars = {
      urls: userURLS,
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//for /urls/:id
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL:
      urlDatabase[req.params.shortURL] &&
      urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//Login Page
app.get("/login", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    res.redirect("/urls");
  }
  res.render("urls_login.ejs");
});

//Register page
app.get("/register", (req, res) => {
  res.render("urls_register.ejs");
});

//Go to shortURL link website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Read
app.get("/u/:id", (req, res) => {
  const urls = urlDatabase[req.params.userID];
  res.redirect("/urls", urls);
});

//POST ENDPOINTS

//Delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    //Only the creator of the URL can delete the link
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

//Edit a URL
app.post("/urls/:id", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    //Only the creater of the URL can edit and see their URLS
    urlDatabase[req.params.id].longURL = req.body.longURL; 
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

//Register a new user
app.post("/register", (req, res) => {
  if (getUserByEmail(users, req.body.email)) {
    //checks if email is already registered
    res.sendStatus(400);
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  let id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = id;

  res.redirect("/urls");
});

//login
app.post("/login", (req, res) => {
  let user = getUserByEmail(users, req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
  });

//logout
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/urls");
});

//NEW URL
app.post("/urls", (req, res) => {
  if (isLoggedIn(users, req.session)) {
    const randomStr = generateRandomString();
    urlDatabase[randomStr] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${randomStr}`);
  }
  res.sendStatus(403);
});

//catch all route
app.get("*", (req, res) => {
  res.redirect("/urls");
});

//Server ON message
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
