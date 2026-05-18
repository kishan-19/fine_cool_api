const fs = require("fs");
const path = require("path");
const { sequelize } = require("../config/db");
const { createHasManyRelation } = require("../utils/associationHelper");

const db = {};

// read all model files
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js")
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

// run associations if any
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


db.jobs.hasMany(db.ac_variations, {
  foreignKey: "job_id",
  as: "ac_variations",
  onDelete: "CASCADE",
  hooks: true,
  paranoid: true,
});

db.ac_variations.belongsTo(db.jobs, {
  foreignKey: "job_id",
  as: "job",
});

createHasManyRelation({
  parentModel: db.jobs,
  childModel: db.add_payment,
  alias: "add_payment",
  foreignKey: "job_id",
  paranoid: false,
});

db.sequelize = sequelize;

module.exports = db;
