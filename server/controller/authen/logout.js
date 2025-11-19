async function logout(req, res) {
res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  domain: ".mockapi.io.vn",
  path: "/",
});
  return res.status(200).json({ message: "Logged out" });
}

module.exports = logout;
