/** Routes for demonstrating authentication in Express. */

const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
//to hash a password we need to import bcrypt
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

router.get("/", (req, res, next) => {
  res.send("APP IS WORKING!!!");
});
//HASHING PASSWORD
/** Register user.
 *   {username, password} => {username} */

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username adn passwords are required");
    }
    //hash the password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    //save to db
    //also we set it up into a function const result
    const results = await db.query(
      `INSERT INTO users (username, password)
    VALUES ($1 , $2)
    RETURNING username
    `, //parameters
      [username, hashedPassword]
    );
    //we return that results function.rows at index of 0 so the first one
    return res.json[results.rows[0]];
  } catch (e) {
    console.log(e);
    //in postgres their are very specific codes or pg codes  https://www.postgresql.org/docs/10/errcodes-appendix.html
    if (e.code === "23505") {
      next(new ExpressError("Please pick another", 400));
    }
    return next(e);
  }
});

// JSON Web Tokens
// Authentication in Flask
// Make request with username/password to login route
// Server authenticates & puts user info session
// Session is encoded & signed with Flask-specific scheme
// Session info is sent back to browser in cookie
// Session info is automatically resent with every request via cookie
// This works well for traditional web apps & is straightforward to do
// What if
// We didn’t want to send auth info with certain requests?
// We wanted to share authentication info across multiple APIs / hostnames?
// We’ll use a more API-server friendly process!

// Logging in
// Try to find user first
// If exists, compare hashed password to hash of login password
// bcrypt.compare() resolves to boolean—if true, passwords match!

/** Login: returns {message} on success. */
//Try to find user first
// if exists compare hashed password to hash of login password

router.post("/login", async (req, res, next) => {
  try {
    //we try to pull the username and password using req.body
    const { username, password } = req.body;
    //if no username or password throw in express error
    if (!username || !password) {
      throw new ExpressError("Username adn passwords are required", 400);
    }
    //so now we have to find a user using that username first query based of the user that passed in
    const results = await db.query(
      `SELECT username, password
       FROM users
       WHERE username = $1`,
      [username]
    );
    //we should check to see if their was a user logged in the first place
    const user = results.rows[0];
    //if there is a user do one thing
    if (user) {
      //if we do find user we do await bcrypt.compare,
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username } SECRET_KEY);
        //if the bcrypt compare staement is true then it returns res.json message in insomnia
        return res.json({ message: "Logged in" });
      }
    }
    //else throw express error
    throw new ExpressError("Invalid username/password", 400);
    //we should check to see if their was a user logged in the first place
  } catch (e) {
    return next(e);
  }
});



router.get("/topsecret", ensureLoggedIn, (req, res, next) => {
  try {
    return res.json({ msg: "SIGNED IN! THIS IS TOP SECRET.  I LIKE PURPLE." });
  } catch (e) {
    return next(new ExpressError("Please login first!", 401));
  }
});

router.get("/private", ensureLoggedIn, (req, res, next) => {
  return res.json({ msg: `Welcome to my VIP section, ${req.user.username}` });
});

router.get("/adminhome", ensureAdmin, (req, res, next) => {
  return res.json({ msg: `ADMIN DASHBOARD! WELCOME ${req.user.username}` });
});

module.exports = router;
