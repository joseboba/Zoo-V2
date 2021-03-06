"use strict";

var mongoose = require("mongoose");
var port = 3800;
var app = require("./app");
mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost:27017/ZooV2AM", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Success");
    app.listen(port, () => {
      console.log("El servidor esta corriendo en el puerto:", port);
    });
  })
  .catch((err) => {
    console.log("Error al conectarse", err);
  });
