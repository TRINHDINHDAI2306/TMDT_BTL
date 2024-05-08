const googleCallbackCus = (req, res) => {
  req.session._id = req.user._id;
  res.redirect("/");
};

const facebookCallbackCus = (req, res) => {
  req.session._id = req.customer._id;
  res.redirect("/");
};

const githubCallbackCus = (req, res) => {
  req.session._id = req.customer._id;
  res.redirect("/");
};

module.exports = {
  googleCallbackCus,
  facebookCallbackCus,
  githubCallbackCus,
};