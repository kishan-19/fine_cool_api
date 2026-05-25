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
    onDelete: cascade ? "CASCADE" : "SET NULL",  // parent delele chile also delete "CASCADE"  
    hooks: true,
    paranoid, // true - sofet delete  false - not soft delete
  });

  childModel.belongsTo(parentModel, {
    foreignKey,
    as: parentAlias || parentModel.name.toLowerCase(),
  });
};

module.exports = {
  createHasManyRelation,
};
