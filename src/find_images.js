const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");

const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  // '.ico',
  // '.gif',
];

const IGNORE_DIRS = ["node_modules", "dist", "build", "coverage", "out"];

function findImageFiles(directory) {
  const imageFiles = [];

  function traverse(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      if (IGNORE_DIRS.includes(file)) {
        console.log(`Ignoring directory: ${file}`);
        continue;
      }

      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          console.log(`Found image file: ${fullPath}`);

          imageFiles.push({
            filename: file,
            relative_path: path.relative(directory, fullPath),
            full_path: fullPath,
          });
        }
      }
    }
  }

  traverse(directory);
  return imageFiles;
}

function copyImagesToLocalDir(imageFiles, localDir) {
  // Create the local directory if it doesn't exist
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  // Copy each image to the local directory with unique names
  return imageFiles.map((img) => {
    // Create a unique name based on the relative path to avoid name collisions
    const uniqueName = img.relative_path.replace(/[\/\\]/g, "_");
    const destPath = path.join(localDir, uniqueName);

    // Copy the file
    fs.copyFileSync(img.full_path, destPath);

    return {
      ...img,
      local_path: path.join("images", uniqueName),
    };
  });
}

async function exportToCsv(imageFiles, outputFile) {
  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: "filename", title: "filename" },
      { id: "relative_path", title: "relative_path" },
      { id: "full_path", title: "full_path" },
    ],
  });

  await csvWriter.writeRecords(imageFiles);
}

async function exportToHtml(imageFiles, outputFile) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Image Files Table</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 8px; text-align: left; border: 1px solid #ddd; vertical-align: middle; }
    th { background-color: #f2f2f2; position: sticky; top: 0; }
    img { max-width: 120px; max-height: 120px; object-fit: contain; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:hover { background-color: #f1f1f1; }
    .path-cell { max-width: 400px; overflow: hidden; text-overflow: ellipsis; }
    h1 { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Image Files Table</h1>
  <table>
    <thead>
      <tr>
        <th>Filename</th>
        <th>Preview</th>
        <th>Relative Path</th>
      </tr>
    </thead>
    <tbody>
      ${imageFiles
        .map(
          (img) => `
        <tr>
          <td>${img.filename}</td>
          <td><img src="${img.local_path}" alt="${img.filename}"></td>
          <td class="path-cell">${img.relative_path}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
  fs.writeFileSync(outputFile, htmlContent, "utf8");
}

// Update this path to the directory you want to search
const DEFAULT_SEARCH_DIRECTORY = ".";

async function main() {
  const searchDirectory = process.argv[2] || DEFAULT_SEARCH_DIRECTORY;
  const outputFile = "image_files.csv";
  const htmlFile = "image_gallery.html";
  const localImageDir = "images";

  console.log(`Searching for image files in ${searchDirectory}...`);
  const imageFiles = findImageFiles(searchDirectory);

  console.log(`Found ${imageFiles.length} image files`);
  await exportToCsv(imageFiles, outputFile);
  console.log(`Results exported to ${outputFile}`);

  // Copy images to local directory and get updated paths
  console.log(`Copying images to ${localImageDir}...`);
  const imagesWithLocalPaths = copyImagesToLocalDir(imageFiles, localImageDir);

  exportToHtml(imagesWithLocalPaths, htmlFile);
  console.log(`Gallery exported to ${htmlFile}`);
}

main().catch(console.error);
