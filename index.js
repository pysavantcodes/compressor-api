const express = require("express");
const multer = require("multer");
const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "2gb" }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

ffmpeg.setFfmpegPath(ffmpegStatic);

app.get("/", (req, res) => {
  res.send("Test compressor");
});

app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileName = req.file.filename;
  res.json({ fileName: fileName, message: "File uploaded successfully" });
});

app.post("/process", (req, res) => {
  const inputFileName = req.body.fileName;

  ffmpeg()
    .input(`./uploads/${inputFileName}`)
    .videoCodec("libx264")
    .videoBitrate("1000k")
    .audioCodec("aac")
    .saveToFile(`./exports/${inputFileName}`)
    .on("end", () => {
      res.download(`./exports/${inputFileName}`, inputFileName, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ error: "Failed to send processed file" });
        } else {
          fs.unlink(`./exports/${inputFileName}`, (err) => {
            if (err) console.error("Error deleting processed file:", err);
          });
          fs.unlink(`./uploads/${inputFileName}`, (err) => {
            if (err) console.error("Error deleting uploaded file:", err);
          });
        }
      });
    })
    .on("error", (error) => {
      console.error("FFmpeg error:", error);
      res.status(500).json({ error: "Failed to process video" });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
