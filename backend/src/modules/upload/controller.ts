import { Request, Response } from "express";

export const uploadImage = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // multer-storage-cloudinary adds the file URL to req.file.path
    res.status(200).json({
      message: "Image uploaded successfully",
      url: req.file.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
