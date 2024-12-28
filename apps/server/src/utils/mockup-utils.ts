// src/utils/mockup-utils.ts
import fs from "fs";
import path from "path";
import axios from "axios";
import { execSync } from "child_process";
import { IMockupRequest } from "@/types/mockup";
import { v4 as uuidv4 } from "uuid";

export async function generateMockup(opts: IMockupRequest): Promise<string> {
  const { templateUrl, maskUrl, logoUrl, logoWidth, logoHeight, positionX, positionY, rotation } = opts;
  const tmpDir = path.join(process.cwd(), "tmp-" + uuidv4());
  fs.mkdirSync(tmpDir, { recursive: true });

  const templatePath = path.join(tmpDir, "template.jpg");
  const maskPath = path.join(tmpDir, "mask.png");
  const logoPath = path.join(tmpDir, "logo.png");
  const outputPath = path.join(tmpDir, "final_mockup.png");

  await downloadFile(templateUrl, templatePath);
  await downloadFile(maskUrl, maskPath);
  await downloadFile(logoUrl, logoPath);

  try {
    const cmd = [
      `convert "${templatePath}" "${logoPath}"`,
      `-resize ${logoWidth}x${logoHeight}^`,
      `-background none -rotate ${rotation}`,
      `-geometry +${positionX}+${positionY}`,
      `-compose over -composite`,
      `"${maskPath}" -compose over -composite`,
      `-resize 800 "${outputPath}"`
    ].join(" ");
    execSync(cmd, { stdio: "pipe" });
    return outputPath;
  } catch (e) {
    throw e;
  }
}

async function downloadFile(url: string, dest: string) {
  const writer = fs.createWriteStream(dest);
  const response = await axios.get(url, { responseType: "stream" });
  await new Promise<void>((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
