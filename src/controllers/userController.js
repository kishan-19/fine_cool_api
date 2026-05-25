const AppError = require("../utils/AppError");
const hasValue = require("../utils/hasValue");
const tryCatch = require("../utils/tryCatch");

const db = require("../models");
const { Op } = require("sequelize");
const Pagination = require("../utils/Pagination");
const User = db.users;
const Roles = db.roles;

const addUser = tryCatch(async (req, res) => {
  const {
    username,
    email,
    password,
    role_id,
    contact_no,
    area,
    city,
    state,
    pincode,
    company_name,
    id,
  } = req.body;

  if (hasValue(id)) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const existingContact = await User.findOne({
      where: {
        contact_no,
      },
      paranoid: false,
    });

    if (
      existingContact &&
      existingContact.id !== Number(id) &&
      !existingContact.deleted_at
    ) {
      throw new AppError("Contact number already exists", 400);
    }

    if (email) {
      const existingEmail = await User.findOne({
        where: { email },
        paranoid: false,
      });

      if (
        existingEmail &&
        existingEmail.id !== Number(id) &&
        !existingEmail.deleted_at
      ) {
        throw new AppError("Email already exists", 400);
      }
    }

    let roleObject = null;

    if (role_id) {
      roleObject = await Roles.findOne({
        where: {
          role_id: parseInt(role_id),
        },
      });

      if (!hasValue(roleObject)) {
        throw new AppError("Enter a valid role id", 200);
      }
    }

    await user.update({
      username: username || "",
      contact_no: contact_no,
      email: email || null,
      password: password || user.password,
      role_name: roleObject?.role_name || user.role_name,
      role_id: roleObject?.role_id || user.role_id,
      area: area || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      company_name,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  }

  // add new user

  const existingContact = await User.findOne({
    where: { contact_no },
    paranoid: false,
  });
  if (existingContact && !existingContact.deleted_at) {
    throw new AppError("Contact number already exists", 400);
  }

  if (existingContact && existingContact.deleted_at) {
    const existingEmail = await User.findOne({
      where: { email },
      paranoid: false,
    });

    if (existingEmail && !existingEmail.deleted_at) {
      throw new AppError("Email already exists", 400);
    }

    await existingContact.restore();

    let roleObject = null;

    if (role_id) {
      roleObject = await Roles.findOne({
        where: { role_id: parseInt(role_id) },
      });
    }

    await existingContact.update({
      username: username || "",
      email: email || null,
      password: password || "",
      role_name: roleObject?.role_name || "Technician",
      role_id: roleObject?.role_id || 3,
      area: area || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      company_name,
    });

    return res.status(200).json({
      success: true,
      message: "User restored successfully",
    });
  }

  if (email) {
    const existingEmail = await User.findOne({
      where: { email },
      paranoid: false,
    });
    if (existingEmail && !existingEmail.deleted_at) {
      throw new AppError("Email already exists", 400);
    }

    if (existingEmail && existingEmail.deleted_at) {
      await existingEmail.restore();

      let roleObject = null;

      if (role_id) {
        roleObject = await Roles.findOne({
          where: { role_id: parseInt(role_id) },
        });
      }

      await existingEmail.update({
        username: username || "",
        contact_no: contact_no,
        password: password || "",
        role_name: roleObject?.role_name || "Technician",
        role_id: roleObject?.role_id || 3,
        area: area || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        company_name,
      });

      return res.status(200).json({
        success: true,
        message: "User restored successfully",
      });
    }
  }

  let roleObject = null;
  if (role_id) {
    roleObject = await Roles.findOne({
      where: { role_id: parseInt(role_id) },
    });
  }
  await User.create({
    username: username || "",
    contact_no,
    email: email || null,
    password: password || "",
    role_name: roleObject?.name || "Technician",
    role_id: roleObject?.role_id || 3,
    area: area || "",
    city: city || "",
    state: state || "",
    pincode: pincode || "",
    company_name,
  });

  res.status(201).json({
    success: true,
    message: "User added successfully",
  });
});

const getUsers = tryCatch(async (req, res) => {
  const { search } = req.body || {};
   const pagination = Pagination.build(req.body);
  const users = await User.findAll({
    where: search
      ? {
          username: {
            [Op.like]: `%${search}%`,
          },
        }
      : {},
    order: [["id", "DESC"]],
    ...(pagination.isPaginated &&{
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    attributes: { 
      exclude: ["token", "password", "deleted_at"],
    },
  });
  res.status(200).json({
    success: true,
    message: "User List Found",
    data: users,
  });
});

const deleteUser = tryCatch(async (req, res, next) => {
  const { id } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await user.destroy();
  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = { addUser, getUsers, deleteUser };
