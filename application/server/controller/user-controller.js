const bcrypt = require("bcrypt");
const {
  models: { User },
} = require("../models");

module.exports = {
  newUser: (req, res) => {
    const { username, email, password, rePassword } = req.body;

    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          username,
          email,
          password: hashedPassword,
        });
      })
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        res.status(500).send(err.message);
        console.log(err);
      })
  }
}