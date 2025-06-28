const express = require('express');
const userController = require('../../controllers/users/userController')
const userRouter = express.Router();

// ! REGISTER
userRouter.post('/register',userController.register);
userRouter.post('/login',userController.login);
userRouter.post('/logout',userController.logout);
userRouter.get('/auth/google',userController.googleAuth);
userRouter.get('/auth/google/callback',userController.googleAuthcallback);
userRouter.get('/checkAuthenticated',userController.checkAuthenticated);
module.exports = userRouter;