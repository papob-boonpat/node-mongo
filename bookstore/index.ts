import express from "express";
import { Db, Document, ObjectId, WithId } from "mongodb";

const app = express();

app.use(express.json());

const { connectToDB, getDB } = require("./db");

let db: Db;
connectToDB((err: any) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("listening on port 3000");
    });

    db = getDB();
  }
});

app.get("/books", (req, res) => {
  let books: WithId<Document>[] = [];
  db.collection("books")
    .find()
    .sort({ author: 1 })
    .forEach((book) => {
      books.push(book);
    })
    .then(() => {
      res.status(200).json(books);
    })
    .catch((err) => {
      res.status(500).json({ err: "could not fetch document" });
    });
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((book) => {
        res.json(book);
      })
      .catch((err) => {
        res.status(500).json({ err: "could not fetch document" });
      });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => res.status(201).json(result))
    .catch((err) => {
      res.status(500).json({ message: "Could not create a new document" });
    });
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(500).json({ err: "could not fetch document" });
      });
  }
});
app.patch("/books/:id", (req, res) => {
  const update = req.body;
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update })
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        res.status(500).json({ err: "could not fetch document" });
      });
  }
});

app.get("/sales", async (req, res) => {
  const result = await db.collection("sales").aggregate([
    {
      $group: {
        _id: "$cat",
        total: { $sum: "$sales" },
        items: { $addToSet: "$name" },
      },
    },
    { $set: { cat: "$_id" } },
    { $unset: ["_id"] },
  ]);

  // const result = await db.collection("sales").find();
  // console.log("inn");

  // for await (const doc of result) {
  //   console.log(doc);
  // }

  const x = await result.toArray();

  console.log(x);

  res.json(x);
  // try {
  //   const result = await db.collection("sales").find();

  //   console.log(result);
  // } catch (err) {
  //   res.status(500).json(err);
  // }
});
