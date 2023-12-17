const express = require("express");
const fs = require("fs");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", (req, res) => {
  const range = req.headers.range;
  // console.log(req.headers)
  if (!range) {
    res.status(400).send("Missing range header");
  }
  console.log(range)
  const videoPath = "data/movie scene.mp4";
  const stats = fs.statSync(videoPath);
  const fileSizeInBytes = stats.size;
  console.log(`Total file size n bytes: ${fileSizeInBytes}`);

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, fileSizeInBytes - 1);
  console.log(start,end)

  // Create headers
  const contentLength = end - start + 1;
  console.log(`Content-Range bytes ${start}-${end}/${fileSizeInBytes}`)
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${fileSizeInBytes}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
