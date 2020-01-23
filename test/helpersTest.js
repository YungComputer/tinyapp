const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "userRandomID2": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with a valid email', function() {
    const userName = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert(userName, expectedOutput);
  });

  it('should return null if passed an email not in the user database', function() {
    const invalidUser = getUserByEmail(testUsers, "hello@johnny.com");
    const expectedOutput = null;
    assert.strictEqual(invalidUser, expectedOutput);
  });
});

