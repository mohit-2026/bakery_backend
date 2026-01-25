const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    const header = req.header("Authorization");

    const token =
      (header && header.startsWith("Bearer ")
        ? header.replace("Bearer ", "")
        : null) ||
      req.query.token;

    if (!token) {
      return res.status(401).json({ msg: "No token, access denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // If your token stores user directly:
      req.user = decoded.user || decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ msg: "Token is not valid" });
    }
  };
};
