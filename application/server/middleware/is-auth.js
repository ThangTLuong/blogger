const isAuth = (req, res, next) => {
  if (req.session.user_id) next();
}

module.exports = isAuth;