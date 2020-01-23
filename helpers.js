//checks if email is already in database
const getUserByEmail = function(userDatabase, email) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }
  return null;
};

module.exports = { getUserByEmail }