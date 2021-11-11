const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(
  `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.r7qfr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
);

const db = mongoose.connection;

db.once("open", function () {
  console.log("Connection Succeed");
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});

//routes
app.get("/", (req, res) => {
  console.log("hemlo");
  res.status(201).send("HOME");
});

app.get("/ping", (req, res) => {
  res.status(201).send({ ok: true, msg: "pong" });
});

app.post("/info", (req, res) => {
  console.log(req.body);
  if (req.body.user === "alice") {
    res.status(201).send({
      ok: true,
      author: {
        email: "alice@gmail.com",
        name: "Alice",
      },
      frontend: {
        url: "http://localhost:3000/",
      },
      language: "node.js | python",
      sources:
        "string, the url of a github repository including your backend sources and your frontend sources",
    });
  } else if (req.body.user === "bob") {
    res.status(201).send({
      ok: true,
      author: {
        email: "bob@rocket.com",
        name: "Bob",
      },
      frontend: {
        url: "http://localhost:3000/",
      },
      language: "node.js | python",
      sources:
        "string, the url of a github repository including your backend sources and your frontend sources",
    });
  }
});

app.get("/conversations", (req, res) => {
  db.collection("chats")
    .find()
    .toArray(function (err, result) {
      if (err) throw err;
      res.status(201).send({
        ok: true,
        conversations: result,
      });
    });
});

app.post("/mutations", (req, res) => {
  console.log("req.body");
  console.log(req.body);

  if (req.body.data.type == "insert") {
    console.log("INSERTING");
    let a = req.body.origin.alice;
    let b = req.body.origin.bob;

    if (req.body.author == "alice") a++;
    else if (req.body.author == "bob") b++;

    let convo = {
      conversations: [
        {
          id: req.body.author,
          text: req.body.text,
          lastMutation: {
            // The last mutation of this conversation
            type: "insert",
            index: "temp_index",
            length: "undefined",
            text: req.body.data.text,
            author: req.body.author,
            origin: {
              alice: a,
              bob: b,
            },
          },
        },
      ],
    };
    db.collection("chats").insertOne(convo, (err, result) => {
      if (err) throw err;
      console.log(result);
    });
    res.status(201).send({
      ok: true,
      text: req.body.data.text, //need to add the old text along
    });
  } else if (req.body.data.type == "delete") {
    console.log("DELETING", req.body);

    //get Last mutation
    db.collection("chats").findOneAndDelete(
      {},
      { sort: { $natural: -1 } },
      (e, r) => {
        if (e) throw e;
        else console.log("-------================================->", r);
      }
    );

    res.status(201).send({
      ok: true,
      text: req.body.data.text, //need to add the old text along
    });
  } else {
    res.status(400).send({
      ok: false,
      msg: "Changes failed!!", //need to add the old text along
    });
  }
});

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
}
