"use strict";

var User = require("../models/user.model");
//Bcrypt encripta contraseñas u objetos específcos
var bcrypt = require("bcrypt-nodejs");
//Generador de tokens para roles de usuarios
var jwt = require("../services/jwt");
//Administrar archivos(eliminar, etc.)
var fs = require("fs");
//Verificar si existen archivos(rutas fisicas)
var path = require("path");

function saveUser(req, res) {
  var user = new User();
  var params = req.body;

  if (params.name && params.username && params.email && params.password) {
    User.findOne(
      { $or: [{ username: params.username }, { email: params.email }] },
      (err, userFound) => {
        if (err) {
          res.status(500).send(err);
        } else if (userFound) {
          res.send({ message: "Usuario o correo ya están en uso" });
        } else {
          user.name = params.name;
          user.username = params.username;
          user.email = params.email;
          user.role = params.role;
          bcrypt.hash(params.password, null, null, (err, password) => {
            if (err) {
              res.status(500).send(err);
            } else if (password) {
              user.password = password;
              user.save((err, userSaved) => {
                if (err) {
                  res.status(500).send(err);
                } else if (userSaved) {
                  res.send(userSaved);
                } else {
                  res.status(404).send({ message: "El usuario no se guardó" });
                }
              });
            } else {
              res.send({ message: "Error al encriptar contraseña" });
            }
          });
        }
      }
    );
  } else {
    res.send({ message: "Ingrese los datos necesarios" });
  }
}

function login(req, res) {
  var params = req.body;

  if ((params.username || params.email) && params.password) {
    User.findOne(
      { $or: [{ username: params.username }, { email: params.email }] },
      (err, userFound) => {
        if (err) {
          res.status(500).send(err);
        } else if (userFound) {
          bcrypt.compare(
            params.password,
            userFound.password,
            (err, password) => {
              if (err) {
                res.send(err);
              } else if (password) {
                if (params.gettoken) {
                  res.send({ token: jwt.createToken(userFound) });
                } else {
                  res.send(userFound);
                }
              } else {
                res.send({ message: "Contraseña incorrecta" });
              }
            }
          );
        } else {
          res.send({ message: "Usuario y/o contraseña incorrectos" });
        }
      }
    );
  } else {
    res.send({ message: "Ingresa los datos para iniciar sesion" });
  }
}

function pruebaMiddleware(req, res) {
  res.send({ message: "Prueba de middleware correcta" });
}

function updateUser(req, res) {
  var userId = req.params.id;
  var update = req.body;

  if (userId != req.user.sub) {
    res
      .status(403)
      .send({ message: "No tiene permisos para ingresar a la ruta" });
  } else {
    User.findByIdAndUpdate(
      userId,
      update,
      { new: true },
      (err, userUpdated) => {
        if (err) {
          res.status(500).send(err);
        } else if (userUpdated) {
          res.send(userUpdated);
        } else {
          res.status(404).send({ message: "No existe este usuario." });
        }
      }
    );
  }
}

function removeUser(req, res) {
  var userId = req.params.id;

  if (userId != req.user.sub) {
    res
      .status(403)
      .send({ message: "No tiene permiso para ingresar a la ruta" });
  } else {
    User.findByIdAndRemove(userId, (err, userRemoved) => {
      if (err) {
        res.status(500).send(err);
      } else if (userRemoved) {
        res.send("EL siguiente usuario ha sido eliminado", userRemoved);
      } else {
        res.status(404).send({ message: "El usuario ya ha sido eliminado" });
      }
    });
  }
}

function removeAdmin(req, res) {
  var adminId = req.params.id;

  if (adminId != req.user.sub) {
    res
      .status(403)
      .send({ message: "No tiene permiso para ingresar a la ruta" });
  } else {
    User.findByIdAndRemove(userId, (err, userRemoved) => {
      if (err) {
        res.status(500).send(err);
      } else if (userRemoved) {
        res.send("EL siguiente usuario ha sido eliminado", userRemoved);
      } else {
        res.status(404).send({ message: "El usuario ya ha sido eliminado" });
      }
    });
  }
}

function uploadImage(req, res) {
  var userId = req.params.id;
  var fileName = "No subido";

  if (userId != req.user.sub) {
    res.status(403).send({ message: "Error de permisos para esta ruta" });
  } else {
    if (req.files) {
      var filePath = req.files.image.path;
      var fileSplit = filePath.split("/");
      var fileName = fileSplit[2];

      var ext = fileName.split(".");
      var fileExt = ext[1];

      if (
        fileExt == "png" ||
        fileExt == "jpg" ||
        fileExt == "jpeg" ||
        fileExt == "gif"
      ) {
        User.findByIdAndUpdate(
          userId,
          { image: fileName },
          { new: true },
          (err, userupdate) => {
            if (err) {
              res.status(500).send({ message: "Error General" });
            } else if (userupdate) {
              res.send({ user: userupdate });
            } else {
              res.status(418).send({ message: "No se ha podido actualizar" });
            }
          }
        );
      } else {
        fs.unlink(filePath, (err) => {
          if (err) {
            res.status(418).send({
              message: "Extencion de archivo no admitido, archivo no eliminado",
            });
          } else {
            res.send({ message: "Extension de archivo no admitida" });
          }
        });
      }
    } else {
      res.status(404).send({ message: "No ha subido una imagen" });
    }
  }
}

function getImage(req, res) {
  let userId = req.params.id;
  var fileName = req.params.image;
  var pathFile = "./uploads/users/" + fileName;

  if (userId != req.user.sub) {
    res
      .status(403)
      .send({ message: "No tiene permisos para ingresar a la ruta" });
  } else {
    fs.exists(pathFile, (exist) => {
      if (exist) {
        res.sendFile(path.resolve(pathFile));
      } else {
        res.status(404).send({ message: "Imagen inexistente" });
      }
    });
  }
}

function getUsers(req, res) {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).send(err);
    } else if (users) {
      res.send(users);
    } else {
      res.status(404).send({ message: "No hay registros" });
    }
  });
}
module.exports = {
  saveUser,
  login,
  pruebaMiddleware,
  updateUser,
  uploadImage,
  getImage,
  removeUser,
  getUsers,
  removeAdmin,
};
