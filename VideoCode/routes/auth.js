/** Routes for demonstrating authentication in Express. */

const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
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
    //hash the password
  } catch (e) {
    return next (e);
  }
})


// router.post("/register", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       throw new ExpressError("Username and password required", 400);
//     }
//     // hash password
//     const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
//     // save to db
//     const results = await db.query(
//       `
//       INSERT INTO users (username, password)
//       VALUES ($1, $2)
//       RETURNING username`,
//       [username, hashedPassword]
//     );
//     return res.json(results.rows[0]);
//   } catch (e) {
//     // console.log(e);
//     if (e.code === "23505") {
//       return next(
//         new ExpressError("Username taken. Please pick another!", 400)
//       );
//     }
//     return next(e);
//   }
// });
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



// router.post("/login", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       throw new ExpressError("Username and password required", 400);
//     }
//     const results = await db.query(
//       `SELECT username, password 
//        FROM users
//        WHERE username = $1`,
//       [username]
//     );
//     const user = results.rows[0];
//     if (user) {
//       if (await bcrypt.compare(password, user.password)) {
//         const token = jwt.sign({ username }, SECRET_KEY);
//         return res.json({ message: `Logged in!`, token });
//       }
//     }
//     throw new ExpressError("Invalid username/password", 400);
//   } catch (e) {
//     return next(e);
//   }
// });





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
