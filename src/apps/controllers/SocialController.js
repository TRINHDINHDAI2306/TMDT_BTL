
const googleCallback = (req, res) => {
  req.session._id = req.user._id;
  res.redirect("/admin/dashboard")
}

const facebookCallback = (req, res) => {
req.session._id = req.user._id;
   res.redirect("/admin/dashboard")
}

const githubCallback = (req, res) => {
  req.session._id = req.user._id;
  res.redirect("/admin/dashboard")
}

module.exports = {
  googleCallback,
  facebookCallback,
  githubCallback

}