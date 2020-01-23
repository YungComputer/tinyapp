const randomatic = require("randomatic");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const salt = 10;
const plainTextPassword1 = "purple-monkey-dinosaur"

function generateRandomString() {
  return randomatic("aA0", 6);
}
//checks if email is already in database
const checkEmail = function(userDatabase, email) {
  for (const userId in userDatabase) {
    if(userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }
  return null;
};

//checks if the user is currently logged in
const isLoggedIn = function(database, cookie) {
  for (const user in database) {
    if (database[user].id === cookie.user_id) {
      return true;
    }
  }
  return null;
}

//returns the URLS where the userID is equal to the ID of the currently logged in user
const urlsForUser = function(id) {
  let result = {};
  for (const url in urlDatabase) {
    // console.log("URL: ", urlDatabase[url].userID)
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url].longURL
    }
  } return result;
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "3rQmlu": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
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
  console.log("hello");
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlsForUser(req.cookies.user_id), 
    user: users[req.cookies.user_id]
    
   };
   console.log(urlsForUser(req.cookies.user_id));
  res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  if (isLoggedIn(users, req.cookies)) {
    res.render("urls_new", { user: req.cookies.user_id });
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"], 
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  res.render("urls_login.ejs");
})

app.get("/register", (req, res) => {
  res.render("urls_register.ejs");
})

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

  let id = generateRandomString();
  users[id] = {
    id,
    email: req.body.email,
    password: bcrypt.hash(req.body.password, salt) //hash the password
  };

  res.cookie("user_id", id);

  res.redirect("/urls");
});


//login
app.post("/login", (req, res) => {
  let user = checkEmail(users, req.body.email);
  if (!user) { //if a user with that email cannot be found
    res.sendStatus(403)
  }
   if(user.password !== req.body.password) { //if given password in the form with the existing user's password does not match
    res.sendStatus(403)
}
bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);

  res.cookie("user_id", user.id);

  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});



//Edit
app.post("/urls/:id", (req, res) => {
  
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});


//NEW URL
app.post("/urls", (req, res) => {
   //Log the POST request body to the console
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = {longURL: req.body.longURL, userID: req.cookies.user_id }

  res.redirect(`/urls/${randomStr}`);
});

// //catch all route
// app.get("*", (req, res) => {
//   res.redirect('/urls');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
