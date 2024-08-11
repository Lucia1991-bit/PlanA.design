// materialUploader.js
import admin from "firebase-admin";
import { readdir, statSync } from "fs";
import { join, basename, extname, relative, resolve } from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";

// 加載 .env.local 文件
const result = config({ path: resolve(process.cwd(), ".env.local") });

if (result.error) {
  console.error("Error loading .env.local file:", result.error);
  process.exit(1);
}

console.log("Environment variables loaded successfully");
console.log(
  "FIREBASE_ADMIN_PROJECT_ID:",
  process.env.FIREBASE_ADMIN_PROJECT_ID
);

// 只有在成功加載環境變量後才導入 firebaseAdmin
import { adminDb, adminStorage } from "../lib/firebaseAdmin";

const readdirAsync = promisify(readdir);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 計算項目根目錄
const projectRoot = resolve(__dirname, "..");

async function uploadMaterial(filePath: string, category: string) {
  const fileName = basename(filePath);
  const fileExtension = extname(fileName);
  const materialName = basename(fileName, fileExtension);
  const destination = `materials/${category}/${fileName}`;

  try {
    const [fileExists] = await adminStorage.file(destination).exists();

    await adminStorage.upload(filePath, {
      destination: destination,
      metadata: {
        contentType: "image/jpeg", // 根據實際情況調整
      },
    });

    const file = adminStorage.file(destination);
    await file.makePublic();

    // 使用 getSignedUrl 方法獲取下載 URL
    const [imageUrl] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // 設置一個遠期的過期日期
    });

    const materialDoc = {
      name: materialName,
      category: category,
      imageUrl: imageUrl,
      properties: {},
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = adminDb
      .collection("materials")
      .doc(`${category}_${materialName}`);
    await docRef.set(materialDoc, { merge: true });

    if (fileExists) {
      console.log(`文件已替換並更新: ${category}/${materialName}`);
      await docRef.update({
        updateHistory: admin.firestore.FieldValue.arrayUnion({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          action: "replaced",
        }),
      });
    } else {
      console.log(`新文件上傳成功: ${category}/${materialName}`);
    }
  } catch (error) {
    console.error(`上傳失敗 ${category}/${materialName}:`, error);
  }
}

async function processFolder(folderPath: string, baseFolder: string) {
  const files = await readdirAsync(folderPath);
  const category =
    relative(baseFolder, folderPath).split("/")[0] || "uncategorized";

  for (const file of files) {
    const filePath = join(folderPath, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      await processFolder(filePath, baseFolder);
    } else if (stat.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file)) {
      await uploadMaterial(filePath, category);
    }
  }
}

async function main() {
  const baseFolder = join(__dirname, "materials");
  console.log("當前工作目錄:", process.cwd());
  console.log("腳本位置:", __filename);
  console.log("腳本目錄:", __dirname);
  console.log("項目根目錄:", projectRoot);
  console.log(`開始處理文件夾: ${baseFolder}`);

  try {
    await readdirAsync(baseFolder);
  } catch (error) {
    console.error(`錯誤: 文件夾 '${baseFolder}' 不存在或無法訪問。`);
    console.log(
      '請確保已經在項目根目錄創建了 "materials" 文件夾，並將要上傳的文件放入其中。'
    );
    return;
  }

  await processFolder(baseFolder, baseFolder);
  console.log("所有材質處理完成");
}

main().catch(console.error);
