const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

//middleware function 
function authenticateJWT(req, res, next) {
  try {
    //if this token is verified it will return that actual data in token and save it in const payload
    const payload = jwt.verify(req.body._token, SECRET_KEY);
    // were gonna just store that payload in req.user 
    req.user = payload;
    console.log("You have a valid token")
    return next();
  } catch (e) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  // if there is no user
  if (!req.user) {
    const e = new ExpressError("Unauthorized", 401);
    return next(e);
    
  } else {
    return next();
  }
}

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.type !== 'admin') {
    return next(new ExpressError("Must be an admin to go here!", 401))
  }
  return next();
}

module.exports = { authenticateJWT, ensureLoggedIn, ensureAdmin };