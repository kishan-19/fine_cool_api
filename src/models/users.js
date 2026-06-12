const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_no: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      // unique
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      trim: true,
      set(value) {
        if (value) {
          this.setDataValue("email", value.toLowerCase());
        } else {
          this.setDataValue("email", value);
        }
      },
      validate: {
        isEmail: true,
      },
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_name: {
      type: DataTypes.STRING(50),
      defaultValue: "Technician",
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
      trim: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    area: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
      len: [6, 6],
    },
    FCM_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    paranoid: true,
    deletedAt: "deleted_at",
    timestamps: true, // This automatically adds `createdAt` and `updatedAt`
  },
);

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sync model with database (Optional: uncomment to auto-create the table)
// Removed { alter: true } to prevent the "Too many keys specified" bug in MySQL
// User.sync({force: true, alter: true }).then(() => {
//   console.log("User table created or updated successfully!");
// });

module.exports = User;
