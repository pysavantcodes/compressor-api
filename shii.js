const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Run FFmpeg
ffmpeg()
  // Input file
  .input("reel2.MOV")

  // .fps(24)
  .videoCodec("libx264")
  .videoBitrate("1000k")
  .audioCodec("aac")
  //   .addOptions([
  //     "-crf 28",
  //     "-preset fast", // Faster preset
  //     "-movflags faststart",
  //   ])

  // Output file
  .saveToFile("video2.mp4")

  // Log the percentage of work completed
  .on("progress", (progress) => {
    console.log(progress);
    if (progress.percent) {
      console.log(`Processing: ${Math.floor(progress.percent)}% done`);
    }
  })

  // The callback that is run when FFmpeg is finished
  .on("end", () => {
    console.log("FFmpeg has finished.");
  })

  // The callback that is run when FFmpeg encountered an error
  .on("error", (error) => {
    console.error(error);
  });
