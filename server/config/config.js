module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": "todos",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "uhsxejheylokcb",
    "password": "cbd0819e8380e0b5c9db546351cad95bb3f1ba5a3c681ee569aa4e725e961929",
    "database": "dj004a935is05",
    "host": "ec2-18-210-51-239.compute-1.amazonaws.com",
    "dialect": "postgres"
  }
}