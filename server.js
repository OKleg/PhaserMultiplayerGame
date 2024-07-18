var express = require("express");
var app = express();
var server = require("http").Server(app);
// const io = require("socket.io")(server);
var io = require("socket.io").listen(server);

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("подключился пользователь");
  socket.on("disconnect", function () {
    console.log("пользователь отключился");
  });
});
server.listen(80, function () {
  console.log(`Прослушиваем ${server.address().port}`);
});
