const db = require('../db')

module.exports = db.defineModel('troubles', {
  imagePath: db.STRING,
  troubleDescription: db.STRING
})