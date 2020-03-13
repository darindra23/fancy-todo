const { User } = require("../models");
const createError = require("http-errors");
const { sign } = require("../helpers/jwt");
const { compare } = require("../helpers/hashed");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const generator = require("generate-password");

class Controller {
  static register(req, res, next) {
    User.create(req.body)
      .then(data => {
        res.status(201).json({ Message: "User Has Been Created." });
      })
      .catch(err => {
        next(err);
      });
  }
  static login(req, res, next) {
    let condition = {
      where: {
        username: req.body.username
      }
    };
    User.findOne(condition)
      .then(data => {
        if (!data) {
          // IF DATA NOT FOUND
          throw createError(404);
        } else {
          //IF DATA FOUND
          if (compare(req.body.password, data.password)) {
            // OUTPUT COMPARE TRUE OR FALSE
            let token = sign({
              id: data.id,
              username: req.body.username,
              email: req.body.email
            }); // GENERATE TOKEN JWT
            let fullname = data.fullname;
            res.status(200).json({ token, fullname }); // SEND TOKEN JWT
          } else {
            throw createError(400); // IF WRONG PASSWORD
          }
        }
      })
      .catch(err => {
        next(err);
      });
  }

  static googleLogin(req, res, next) {
    let fullname;
    let username;
    let email;
    let password = generator.generate({
      length: 10,
      numbers: true
    });
    client
      .verifyIdToken({
        idToken: req.body.id_token,
        audience: process.env.CLIENT_ID
      })
      .then(ticket => {
        const payload = ticket.getPayload();
        let condition = {
          where: {
            email: payload.email
          }
        };
        fullname = payload.name;
        username = payload.given_name;
        email = payload.email;
        return User.findOne(condition);
      })
      .then(data => {
        if (data) {
          return data;
        } else {
          return User.create({ fullname, username, email, password });
        }
      })
      .then(user => {
        let token = sign({
          id: user.id,
          username: user.username,
          email: user.email
        });
        res.status(200).json({ token, fullname });
      })
      .catch(err => {
        next(err);
      });
  }
}

module.exports = Controller;
