const express = require("express");
const mongoose = require("mongoose");
const Messages = require("./dbMessage");
const Pusher = require("pusher");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1188279",
  key: "85ccc104eb6aad2077b3",
  secret: "4f4c3cca7128580e1b50",
  cluster: "eu",
  useTLS: true,
});

//middlewares
app.use(express.json());
app.use(cors());

//mongoDB
const connection_url =
  "mongodb+srv://admin:LEZD8b1W7g5ySfzM@cluster0.drkhj.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("connection successful");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("pusher trigger error");
    }
  });
});

app.get("/", (req, res) => {
  res.status(200).send("hello");
});
app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
app.post("/messages/new", (req, res) => {
  const dbmessage = req.body;
  Messages.create(dbmessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});
app.listen(port, () => {
  console.log("listening on port 9000");
});
