var express = require("express");
var app = express();
var server = require("http").Server(app);
const io = require("socket.io")(server);
//const io = require("socket.io").listen(server);
var players = {};
var bombData = {};
var tomatoItem = {
  x: 50 + Math.floor(Math.random() * 550),
  y: 150 + Math.floor(Math.random() * 150),
};
var scores = {
  blue: 0,
  red: 0,
};

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("подключился пользователь");
  // создание нового игрока и добавление го в объект players
  players[socket.id] = {
    x: 100,
    y: 100,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
  };

  // отправляем объект players новому игроку
  socket.emit("currentPlayers", players);
  // отправляем объект star новому игроку
  socket.emit("starLocation", tomatoItem);
  // отправляем текущий счет
  socket.emit("scoreUpdate", scores);
  // обновляем всем другим игрокам информацию о новом игроке
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("disconnect", function () {
    console.log("пользователь " + socket.id + " отключился");
    // удаляем игрока из нашего объекта players
    delete players[socket.id];
    // отправляем сообщение всем игрокам, чтобы удалить этого игрока

    socket.broadcast.emit("disconnect_player", socket.id);
  });
  socket.on("addBomb", function () {
    bombData.x = 40 + Math.floor(Math.random() * 560);
    bombData.dir = Math.random() % 2 ? 100 : -100;
    socket.emit("addedBomb", bombData);
    socket.broadcast.emit("addedBomb", bombData);
  });
  // когда игроки движутся, то обновляем данные по ним
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // отправляем общее сообщение всем игрокам о перемещении игрока
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
  socket.on("starCollected", function () {
    if (players[socket.id].team === "red") {
      scores.red += 10;
    } else {
      scores.blue += 10;
    }
    tomatoItem.x = 50 + Math.floor(Math.random() * 550);
    tomatoItem.y = 150 + Math.floor(Math.random() * 150);
    io.emit("starLocation", tomatoItem);
    io.emit("scoreUpdate", scores);
  });
  // socket.on("playerLose", function(){
  //   socket.broadcast.emit("playerLosed",socket.id)
  // });
});

server.listen(3000, function () {
  console.log(`Прослушиваем ${server.address().port}`);
});
