const createHasManyRelation = ({
  parentModel,
  childModel,
  alias,
  foreignKey,
  parentAlias = null,
  cascade = true,
  paranoid = true,
}) => {
  parentModel.hasMany(childModel, {
    foreignKey,
    as: alias,
    onDelete: cascade ? "CASCADE" : "SET NULL",
    hooks: true,
    paranoid,
  });

  childModel.belongsTo(parentModel, {
    foreignKey,
    as: parentAlias || parentModel.name.toLowerCase(),
  });
};

module.exports = {
  createHasManyRelation,
};
