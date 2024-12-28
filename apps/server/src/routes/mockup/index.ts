// src/routes/mockup/index.ts
import { Router, Request, Response } from "express";
import { generateMockup } from "@/utils/mockup-utils";
import { IMockupRequest } from "@/types/mockup";

const router = Router();

router.post("/generate", async (req: Request<{}, {}, IMockupRequest>, res: Response) => {
  try {
    const { templateUrl, maskUrl, logoUrl, logoWidth, logoHeight, positionX, positionY, rotation } = req.body;
    const filePath = await generateMockup({
      templateUrl,
      maskUrl,
      logoUrl,
      logoWidth,
      logoHeight,
      positionX,
      positionY,
      rotation
    });
    res.download(filePath, "mockup.png", () => {
      // Cleanup happens inside generateMockup, but you could also remove the file here if needed
    });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
});

export default router;
