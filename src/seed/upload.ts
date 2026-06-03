import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "upload");

export function readUploadFile(filename: string): Buffer {
  return fs.readFileSync(path.join(UPLOAD_DIR, filename));
}

export function listUploadFiles(): string[] {
  return fs.readdirSync(UPLOAD_DIR);
}
