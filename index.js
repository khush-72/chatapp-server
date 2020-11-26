import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import cors from "cors";
import Pusher from "pusher";

const app = express();
const port = process.env.PORT || 7000;

const pusher = new Pusher({
  appId: "1113499",
  key: "0bd205f541cd1edd55ad",
  secret: "5ccbee545a18b89259da",
  cluster: "ap2",
  useTLS: true,
});

app.use(express.json());
app.use(cors());

const connectionURL =
  "mongodb+srv://chat_admin:zMNNuHf5btPY2HRo@cluster0.qw07k.mongodb.net/chatMERN?retryWrites=true&w=majority";

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("Db is connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        message: messageDetails.message,
        name: messageDetails.name,
        timestamp: messageDetails.timestamp,
        recieved: messageDetails.recieved,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Hello");
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbmessage = req.body;
  Messages.create(dbmessage, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`server started at port: ${port}`);
});
