const express = require('express');
const { addUserValidation, deleteUserValidation } = require('../validations/userValidations');
const userController = require('../controllers/userController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all users
router.post('/list',userController.getUsers);
router.post('/add',addUserValidation,userController.addUser);
router.post('/delete',AuthMiddleware,deleteUserValidation,userController.deleteUser);


module.exports = router;
