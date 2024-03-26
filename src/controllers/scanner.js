import { convertRomanNumeralToInteger } from "../utilities/extractRelevantInformation.js";
import { createRectangles } from "../utilities/tesseract/createRectangles.js";
import { preProcessImage } from "../utilities/sharp/preProcessImage.js";
import { writeFileSync } from "fs";

export async function scan(req, res) {
  const base64versionImage = req.body.image;
  if (!base64versionImage) {
    return res
      .status(400)
      .json({ error: "Image data is missing in the request body" });
  }
  const worker = await createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-:. ",
  });
  const preProcessedImage = await preProcessImage(base64versionImage);
  try {
    console.log("Good till above semInRoman");
    const semInRoman = await getJobDone(
      preProcessedImage,
      createRectangles("semester")
    );
    const currentSemesterNumber =
      convertRomanNumeralToInteger(semInRoman).trim();
    console.log("Good till above personalInfo");
    const personalInfo = await getJobDone(
      preProcessedImage,
      createRectangles("personal-info")
    );
    const [registraionNumber, studentName, fatherName, motherName, courseName] =
      personalInfo;
    const gpa = await getJobDone(preProcessedImage, createRectangles("gpa"));

    console.log(registraionNumber, currentSemesterNumber);

    res.json({
      ocrResponse: [registraionNumber, currentSemesterNumber],
      formattedString: "",
    });
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

