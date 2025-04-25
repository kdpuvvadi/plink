import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      const vercelConfigPath = join(process.cwd(), "vercel.json");
      const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, "utf8"));
      const redirects = vercelConfig.redirects || [];
      res.status(200).json(redirects);
    } catch (error) {
      res.status(500).json({ error: "Failed to read redirects" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
