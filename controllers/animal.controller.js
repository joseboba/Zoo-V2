"use strict";

var Animal = require("../models/animal.model");
var fs = require("fs");
var path = require("path");

function animalSaved(req, res) {
  let userID = req.params.id;
  let params = req.body;
  let animal = new Animal();

  if (userID != req.user.sub) {
    res.send({ message: "No se puede acceder" });
  } else {
    if (params.name && params.age && params.nickName && params.carer) {
      Animal.findOne(
        { name: params.name, age: params.age, nickName: params.nickName },
        (err, animalFound) => {
          if (err) {
            res.status(500).send(err);
          } else if (animalFound) {
            res.send({ message: "Este animal ya fue creado" });
          } else {
            animal.name = params.name;
            animal.age = params.age;
            animal.nickName = params.nickName;
            animal.carer = params.carer;
            animal.save((err, animalSaved) => {
              if (err) {
                res.status(500).send(err);
              } else if (animalSaved) {
                res
                  .send({
                    message: "El siguiente animal fue guardado: ",
                    animalSaved,
                  })
                  .populate("carer");
              } else {
                res.status(418).send({ message: "El animal no fue guardado" });
              }
            });
          }
        }
      );
    } else {
      res.send({ message: "Ingrese los datos requeridos" });
    }
  }
}

function updateAnimal(req, res) {
  let adminId = req.params.id;
  let animalId = req.params.Aid;
  let change = req.body;
  if (adminId) {
    if (adminId != req.user.sub) {
      res.status(403).send({ message: "No tienes acceso a esta ruta" });
    } else {
      Animal.findByIdAndUpdate(
        animalId,
        change,
        { new: true },
        (err, animalUpdated) => {
          if (err) {
            res.status(500).send(err);
          } else if (animalUpdated) {
            res.send({
              message: "Se han hecho los cambios correspondientes: ",
              animalSaved,
            });
          } else {
            res.status(418).send({ message: "El animal ingresado no existe" });
          }
        }
      );
    }
  } else {
    res.send({ message: "Ingrese ID de administrador para actualizar animal" });
  }
}

function removeAnimal(req, res) {
  let adminId = req.params.id;
  let animalId = req.params.Aid;
  if (adminId) {
    if (adminId != req.user.sub) {
      res.status(403).send({ message: "No tiene acceso a esta ruta" });
    } else {
      Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
        if (err) {
          res.status(500).send(err);
        } else if (animalRemoved) {
          res.send({
            message: "Se ha eliminado con exito el siguiente animal: ",
            animalRemoved,
          });
        } else {
          res.status(404).send({ message: "El animal ya fue eliminado" });
        }
      });
    }
  } else {
    res.send({ message: "Ingrese ID de administrador para eliminar animal" });
  }
}

function uploadImage(req, res) {
  let adminId = req.params.id;
  let animalId = req.params.Aid;
  let fileName = "";

  if (adminId && animalId) {
    if (adminId != req.user.sub) {
      res.send({ message: "No tiene acceso a esta ruta" });
    } else {
      if (req.files) {
        let filePath = req.files.image.path;
        let fileSplit = filePath.split("/");
        let fileName = fileSplit[2];

        let ext = fileName.split(".");
        let fileExt = ext[1];

        if (
          fileExt == "JPEG" ||
          fileExt == "jpeg" ||
          fileExt == "PNG" ||
          fileExt == "img" ||
          fileExt == "gif" ||
          fileExt == "png" ||
          fileExt == "jpg"
        ) {
          Animal.findByIdAndUpdate(
            animalId,
            { image: fileName },
            { new: true },
            (err, imageSaved) => {
              if (err) {
                res.status(500).send(err);
              } else if (imageSaved) {
                res.send(imageSaved);
              } else {
                res.status(404).send({
                  message: "No existe el animal al asignarle una imagen",
                });
              }
            }
          );
        } else {
          fs.unlink(filePath, (err) => {
            if (err) {
              res.status(418).send(
                {
                  message:
                    "Extencion de archivo no admitido, archivo no eliminado",
                },
                err
              );
            } else {
              res.send({ message: "Extension de archivo no admitida" });
            }
          });
        }
      } else {
        res.send({ message: "Unicamente se puede subir imagenes" });
      }
    }
  } else {
    res.send({ message: "Ingrese los ID necesarios para subir una imagen" });
  }
}

function getImage(req, res) {
  let adminId = req.params.id;
  let animalId = req.params.Aid;
  let fileName = req.params.image;
  let filePath = "./uploads/animals/" + fileName;

  if (adminId != req.user.sub) {
    res.status(403).send({ message: "No tienes acceso a esta ruta" });
  } else {
    fs.exists(filePath, (exists) => {
      if (exists) {
        res.sendFile(path.resolve(filePath));
      } else {
        res.status(404).send({ message: "Imagen inexistente" });
        console.log(fileName);
      }
    });
  }
}

// OPEN FUNCTIONS
function getAnimals(req, res) {
  Animal.find({}, (err, animalFound) => {
    if (err) {
      res.status(500).send(err);
    } else if (animalFound) {
      res.send(animalFound);
    } else {
      res.status(404).send({ message: "No hay registros" });
    }
  }).populate("carer");
}

function searchAnimal(req, res) {
  let animalId = req.body;

  Animal.findById({ animalId }, (err, animalFound) => {
    if (err) {
      res.status(500).send(err);
    } else if (animalFound) {
      res.send(animalFound);
    } else {
      res
        .status(404)
        .send({ message: "No existe el animal que usted está buscando" });
    }
  });
}

module.exports = {
  animalSaved,
  updateAnimal,
  removeAnimal,
  uploadImage,
  getImage,
  getAnimals,
  searchAnimal,
};
