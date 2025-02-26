const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");
const { execSync } = require("child_process");
const Table = require("cli-table3");
const packageJson = require("./package.json");
const { URL } = require("url");
const psl = require("psl");

const VERCEL_CONFIG = "vercel.json";
const BASE_URL = "https://p.puvvadi.net"; // Updated base URL

console.log(`\n${packageJson.name} v${packageJson.version} - ${packageJson.description}\n`);

// Function to generate an 8-character short code
const generateShortCode = (url) => {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 8);
};

// Read `vercel.json`
const vercelConfig = JSON.parse(fs.readFileSync(VERCEL_CONFIG, "utf8"));

// Get command and optional URL from arguments
const command = process.argv[2]; // "add", "delete", or "list"
const longUrl = process.argv[3];

if (!command) {
  console.error("Usage:");
  console.error("  yarn run add <destination-url>");
  console.error("  yarn run delete");
  console.error("  yarn run list");
  process.exit(1);
}

// Function to confirm and push changes
const confirmAndPush = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Push changes to Git? (y/n): ", (answer) => {
    if (answer.toLowerCase() === "y") {
      try {
        console.log("Pushing changes...");
        execSync("git push", { stdio: "inherit" });
        console.log("Changes pushed to GitHub.");
      } catch (error) {
        console.error("Git error:", error.message);
      }
    } else {
      console.log("Changes committed but not pushed.");
    }
    rl.close();
  });
};


// Handle listing all redirects
if (command === "list") {
  if (vercelConfig.redirects.length === 0) {
    console.log("No redirects found.");
    process.exit(0);
  }

  const table = new Table({
    head: ["Index", "Short URL", "Destination URL"],
    colWidths: [8, 40, 70], // Adjusted column widths
    wordWrap: true,
  });

  vercelConfig.redirects.forEach((r, index) => {
    table.push([index + 1, `${BASE_URL}${r.source}`, r.destination]);
  });

  console.log("\nCurrent Shortened URLs:\n");
  console.log(table.toString());
  process.exit(0);
}

// Validate the URL
const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }
    const parsedDomain = psl.parse(parsedUrl.hostname);
    return parsedDomain.domain && parsedDomain.sld && parsedDomain.tld;
  } catch (e) {
    return false;
  }
};

// Handle adding a URL
if (command === "add") {
  if (!longUrl || !isValidUrl(longUrl)) {
    console.error("Invalid URL. Please provide a valid HTTP/HTTPS URL with a recognized TLD.");
    process.exit(1);
  }
  const existingRedirect = vercelConfig.redirects.find((r) => r.destination === longUrl);
  if (existingRedirect) {
    console.log(`Existing Short URL: ${BASE_URL}${existingRedirect.source}`);
    process.exit(0);
  }
  const shortCode = generateShortCode(longUrl);
  const shortPath = `/${shortCode}`;
  vercelConfig.redirects.push({ source: shortPath, destination: longUrl, permanent: true });
  fs.writeFileSync(VERCEL_CONFIG, JSON.stringify(vercelConfig, null, 2));
  console.log(`New Short URL: ${BASE_URL}${shortPath}`);
  try {
    execSync("git add vercel.json");
    execSync(`git commit -m "Added short URL for ${longUrl}"`);
    console.log("Changes committed.");
    confirmAndPush();
  } catch (error) {
    console.error("Git error:", error.message);
  }
}

// Handle deleting a redirect
if (command === "delete") {
  if (vercelConfig.redirects.length === 0) {
    console.log("No redirects found.");
    process.exit(0);
  }

  console.log("Select a redirect to delete:");
  vercelConfig.redirects.forEach((r, index) =>
    console.log(`${index + 1}. ${BASE_URL}${r.source} -> ${r.destination}`)
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the number of the redirect to delete: ", (answer) => {
    const index = parseInt(answer, 10) - 1;
    if (index >= 0 && index < vercelConfig.redirects.length) {
      const removedRedirect = vercelConfig.redirects.splice(index, 1)[0];
      fs.writeFileSync(VERCEL_CONFIG, JSON.stringify(vercelConfig, null, 2));

      console.log(`Deleted redirect: ${BASE_URL}${removedRedirect.source} -> ${removedRedirect.destination}`);

      try {
        execSync("git add vercel.json");
        execSync(`git commit -m "Deleted short URL ${removedRedirect.source}"`);
        console.log("Changes committed.");
        confirmAndPush();
      } catch (error) {
        console.error("Git error:", error.message);
      }
    } else {
      console.log("Invalid selection. No redirect deleted.");
    }
    rl.close();
  });
}
