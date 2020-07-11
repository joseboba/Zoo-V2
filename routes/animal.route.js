"use strict";

var express = require("express");
var animalController = require("../controllers/animal.controller");
var mdAuth = require("../middlerwars/authenticated");
var api = express.Router();
var connectMultiparty = require("connect-multiparty");
var mdUpload = connectMultiparty({ uploadDir: "./uploads/animals" });

//ROUTES FOR ADMIN
api.post(
  "/saveAnimal/:id",
  mdAuth.ensureAuthAdmin,
  animalController.animalSaved
);
api.put(
  "/updateAnimal/:id/:Aid",
  mdAuth.ensureAuthAdmin,
  animalController.updateAnimal
);
api.delete(
  "/removeAnimal/:id/:Aid",
  mdAuth.ensureAuthAdmin,
  animalController.removeAnimal
);
api.put(
  "/uploadImage/:id/:Aid",
  [mdAuth.ensureAuthAdmin, mdUpload],
  animalController.uploadImage
);
api.get(
  "/getImage/:id/:Aid/:image",
  [mdAuth.ensureAuthAdmin, mdUpload],
  animalController.getImage
);

//ROUTES TO EVERYONE
api.get("/getAnimals", animalController.getAnimals);
api.get("/searchAnimal", animalController.searchAnimal);

module.exports = api;
