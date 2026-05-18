const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AddPayment = sequelize.define(
  "add_payment",
  {
    payment_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount:{
        type: DataTypes.STRING(20),
        allowNull: false,
        required: true,
    },
    mode:{
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    remark:{
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  { 
    tableName: "add_payment",
    timestamps: true,
   },
);

module.exports = AddPayment;