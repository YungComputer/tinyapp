//checks and returns a username with a valid email stored in the database
const getUserByEmail = function(userDatabase, email) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email) {
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



module.exports = { getUserByEmail, isLoggedIn, urlsForUser }