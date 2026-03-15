async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".mock-api-server-sy5n.onrender.com",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out" });
}

module.exports = logout;