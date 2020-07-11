'use strict';

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlerwars/authenticated')
var connectMultiparty = require('connect-multiparty');  //MANEJO DE ARCHIVOS
var api = express();
var mdUpload =  connectMultiparty({uploadDir:'./uploads/users'});

//USERS
api.post('/saveUser', userController.saveUser);
api.post('/login', userController.login);

//MIDDLEWARE-USERS
api.get('/pruebaMiddleware', mdAuth.ensureAuth, userController.pruebaMiddleware);
api.put('/updateUser/:id',mdAuth.ensureAuth,userController.updateUser);
api.put('/uploadImage/:id', [mdAuth.ensureAuth, mdUpload], userController.uploadImage);
api.put('/uploadImageAdmin/:id', [mdAuth.ensureAuthAdmin, mdUpload], userController.uploadImage);
api.get('/getImage/:id/:image',[mdAuth.ensureAuth, mdUpload], userController.getImage);
api.delete('/removeUser/:id', [mdAuth.ensureAuth], userController.removeUser);
api.delete('/removeAdmin/:id', [mdAuth.ensureAuthAdmin], userController.removeAdmin);
//MIDDLEWARE-ADMIN
api.get('/getUsers', mdAuth.ensureAuthAdmin, userController.getUsers);
module.exports = api;   