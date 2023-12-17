const express = require("express");
const fs = require("fs");

const mongodb = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");

const url = "mongodb://localhost";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/html/index.html");
});

app.get("/init-video", function (req, res) {
  res.sendFile(__dirname + "/html/upload.html");
});
io.on("connection", (socket) => {
  console.log();
  console.log(`A user connected: ${socket.id}`);

  const client = new mongodb.MongoClient(url);
  client
    .connect()
    .then((tt) => {
      //   console.log(tt);
      const db = client.db("vstream");
      console.log(`Created database "${db.databaseName}"!`);
      //   console.log(db);
      const bucket = new mongodb.GridFSBucket(db);
      const videoUploadStream = bucket.openUploadStream("videoData");
      //   "./data/movie scene.mp4");
      const videoPath = "./data/Arya.mp4";
      const videoReadStream = fs.createReadStream(videoPath);
      const stats = fs.statSync(videoPath);
      const fileSizeInBytes = stats.size;
      console.log(`Total file size n bytes: ${fileSizeInBytes}`);
      videoReadStream.pipe(videoUploadStream);

      //   videoReadStream.on("data", (chunk) => {
      //     // console.log(videoReadStream.bytesRead);
      //     // console.log(videoUploadStream.chunkSizeBytes)
      //     // console.log(videoUploadStream.length)
      //     // bytesUploaded += chunk.length;
      //     const progress = videoReadStream.bytesRead / fileSizeInBytes;
      //     // console.log(progress);
      //     io.emit("upload_progress", progress);
      //   });
      videoUploadStream.on("drain", (chunk) => {
        // console.log(videoReadStream.bytesRead);
        // console.log(videoUploadStream.chunkSizeBytes)
        // console.log(videoUploadStream.length);
        // bytesUploaded += chunk.length;
        const progress = videoUploadStream.length / fileSizeInBytes;
        // console.log(progress);
        socket.emit("upload_progress", progress);
      });
      videoUploadStream.on("close", () => {
        // console.log(videoUploadStream);
        console.log("File upload complete!");
        // Run your code here.
        // res.status(200).send("Done...");
        client.close();
        socket.disconnect();
      });
    })
    .catch((err) => {
      res.json(error);
    })
    .finally(() => {
      //   client.close();
      console.log("Completed...");
    });

  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
