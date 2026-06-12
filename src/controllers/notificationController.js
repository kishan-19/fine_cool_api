const tryCatch = require("../utils/tryCatch");
const { getMessaging } = require("firebase-admin/messaging");
const { Op } = require("sequelize");
const db = require("../models");
const User = db.users;

const sendNotifiaction = tryCatch(async (req, res, next) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "FCM token required",
    });
  }

  const message = {
    token: token,

    notification: {
      title: title || "Notification",
      body: body || "Message",
    },

    data: data || {},

    android: {
      priority: "high",

      notification: {
        sound: "default",
        channelId: "high_importance_channel",
      },
    },

    apns: {
      payload: {
        aps: {
          sound: "default",
          contentAvailable: true,
        },
      },
    },
  };
  const response = await getMessaging().send(message);

  return res.status(200).json({
    success: true,
    message: "Notification sent",
    response,
  });
});

const sendAllUserNotification = tryCatch(async (req, res, next) => {
  const { title, body, data } = req.body;

  const users = await User.findAll({
    where: {
      [Op.and]: [
        { FCM_token: { [Op.ne]: null } },
        { FCM_token: { [Op.ne]: "" } },
      ],
    },
  });

  if (!users.length) {
    throw new AppError("No users found", 404);
  }

  const tokens = users.map((user) => user.FCM_token);

  if (!tokens.length) {
    throw new AppError("No FCM tokens found", 404);
  }

  // --- NEW CODE: Format the data payload for Firebase ---
  // Firebase requires all values inside `data` to be strings.
  let formattedData = {};
  if (data && typeof data === "object") {
    for (const key in data) {
      if (typeof data[key] === "object") {
        // If it's a nested object/array, stringify it
        formattedData[key] = JSON.stringify(data[key]);
      } else {
        // Convert numbers/booleans to strings
        formattedData[key] = String(data[key]);
      }
    }
  }

  const message = {
    tokens,

    notification: {
      title: title || "Notification",
      body: body || "Message",
    },

    data: data || {},

    android: {
      priority: "high",
    },

    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  const response = await getMessaging().sendEachForMulticast(message);

  return res.status(200).json({
    success: true,
    message: "Notification sent",
    response,
  });
});

module.exports = { sendNotifiaction, sendAllUserNotification };
