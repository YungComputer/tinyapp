const randomatic = require("randomatic");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

function generateRandomString() {
  return randomatic("aA0", 6);
}

const checkEmail = function(obj, email) {
  for (const user in obj) {
    if(obj[user].email === email) {
      return true;
    }
  }
  return false;
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Register GET endpoint
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  console.log(req.cookies.users);
  let templateVars = { user: users[req.cookies.users], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies.users });
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.users]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/login", (req, res) => {
  res.render("urls_login.ejs");
})

app.get("/register", (req, res) => {
  res.render("urls_register.ejs");
})

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

//Registration
app.post("/register", (req, res) => {
if (checkEmail(users, req.body.email)) { //checks if email is already registered
  res.sendStatus(400);
}

  let randomID = generateRandomString();
  users[randomID] = {
    randomID,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie("user_id", randomID);

  res.redirect("/urls");
});

//Edit
app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});

//login
app.post("/login", (req, res) => {
  res.cookie("users", users[req.cookies.users]);

  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

//UPDATE A RESOURCE
app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`/urls/${randomStr}`);
});

// //catch all route
// app.get("*", (req, res) => {
//   res.redirect('/urls');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
