module.exports = {
  handler(err, req, res, next) {
    if (err.errors) {
      res.status(400).json(err.errors);
    } else if (
      err.name === "JsonWebTokenError" &&
      err.message === "jwt must be provided"
    ) {
      res.status(403).json(err);
    } else if (
      err.name === "JsonWebTokenError" &&
      err.message !== "jwt must be provided"
    ) {
      res.status(401).json(err);
    } else {
      res.status(err.status || 500).json(err);
    }
  }
};
