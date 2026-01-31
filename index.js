import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"; dotenv.config();
import express from 'express';
import fs from 'fs/promises';
import multer from "multer";
import { env } from "node:process";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({});
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.json());

// Endpoint to generate text from a prompt (generate-text)
app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});



// Endpoint to generate text from an image and a prompt (generate-from-image)
app.post('/generate-from-image', upload.single("image"), async (req, res) => {
  const { prompt } = req.body;
  const base64Image = req.file.buffer.toString("base64");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      // contents: [
      //   { text: prompt, type: "text" },
      //   { inline_data: { data: base64Image, mimeType: req.file.mimetype } }
      // ],
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: {mimeType: req.file.mimetype, data: base64Image} },
          ],
        },
      ],
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});



// Endpoint to summarize text from a document (summarize-document)
app.post('/generate-from-document', upload.single("document"), async (req, res) => {
  const documentText = req.file.buffer.toString("utf-8");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: `Summarize the following document: ${documentText}` },
          ],
        },
      ],
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});



// Endpoint to get transcription from audio file (generate-from-audio)
app.post('/generate-from-audio', upload.single("audio"), async (req, res) => {
  const base64Audio = req.file.buffer.toString("base64");
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe the following audio:" },
            { inlineData: { mimeType: req.file.mimetype, data: base64Audio } },
          ],
        },
      ],
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on localhost:${PORT}`));