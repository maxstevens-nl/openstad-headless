'use strict';

const fs   = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt  = require('jsonwebtoken');

/** @type {string|Buffer} */
let secretOrPrivateKey;

/** @type {string|Buffer} */
let secretOrPublicKey;

/** @type {string} */
let signAlgorithm;

if (process.env.JWT_SECRET) {
    secretOrPrivateKey = process.env.JWT_SECRET;
    secretOrPublicKey = process.env.JWT_SECRET;
    signAlgorithm = 'HS256';
} else {
    const certPath = process.env.TEST_CERTS ? 'test/test-certs/' : 'certs/';

    /** Private certificate used for signing JSON WebTokens */
    secretOrPrivateKey = fs.readFileSync(path.join(__dirname, certPath + '/privatekey.pem'));

    /** Public certificate used for verification.  Note: you could also use the private key */
    secretOrPublicKey = fs.readFileSync(path.join(__dirname, certPath + '/certificate.pem'));

    signAlgorithm = 'RS256';
}

/**
 * Creates a signed JSON WebToken and returns it.  Utilizes the private certificate to create
 * the signed JWT.  For more options and other things you can change this to, please see:
 * https://github.com/auth0/node-jsonwebtoken
 *
 * @param  {Number} exp - The number of seconds for this token to expire.  By default it will be 60
 *                        minutes (3600 seconds) if nothing is passed in.
 * @param  {String} sub - The subject or identity of the token.
 * @return {String} The JWT Token
 */
exports.createToken = ({ exp = 3600, sub = '' } = {}) => {
  const token = jwt.sign({
    jti : uuidv4(),
    sub,
    exp : Math.floor(Date.now() / 1000) + exp,
  }, secretOrPrivateKey, {
    algorithm: signAlgorithm,
  });

  return token;
};

/**
 * Verifies the token through the jwt library using the public certificate.
 * @param   {String} token - The token to verify
 * @throws  {Error} Error if the token could not be verified
 * @returns {Object} The token decoded and verified
 */
exports.verifyToken = token => jwt.verify(token, secretOrPublicKey);
