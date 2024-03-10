import { Db, MongoClient } from "mongodb";

let dbConnection: Db;
module.exports = {
  connectToDB: (cb: (err?: any) => void) => {
    MongoClient.connect("mongodb://root:password@192.168.0.33:27017")
      .then((client) => {
        dbConnection = client.db("sales");
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDB: () => dbConnection,
};
