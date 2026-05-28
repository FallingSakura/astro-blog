import fs from "fs";
import path from "path";

const VAULT_PATH = "/Users/yourname/ObsidianVault";
const BLOG_PATH = "./src/data/blog";

function parsePublish(content: string): boolean {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return false;
  return /^publish:\s*true$/m.test(match[1]);
}

function getAllMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getAllMarkdownFiles(VAULT_PATH);
let count = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  if (parsePublish(content)) {
    const dest = path.join(BLOG_PATH, path.basename(file));
    fs.copyFileSync(file, dest);
    console.log(`✓ ${path.basename(file)}`);
    count++;
  }
}

console.log(`\nDone. ${count} file(s) synced.`);