const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const jobVariation = sequelize.define(
  "jobs_variations",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    end_remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Pending",
      enum: ["Pending", "In Progress", "Completed"],
    },
    customer_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    technician_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pdf: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recived_payment:{
      type: DataTypes.STRING(50),
      allowNull:false,
      defaultValue:"", 
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "jobs_variations",
    timestamps: false,
  },
);

module.exports = jobVariation;
