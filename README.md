# URL Shortener with Vercel Redirects

This is a simple URL shortener that uses Vercel's `vercel.json` redirects feature to create short links without requiring a database.

## Features
- Generate an 8-character short URL from a given destination URL
- Automatically updates `vercel.json` with the new redirect
- Ensures the same URL always maps to the same short link
- Allows interactive deletion of redirects
- Lists all current short links in a formatted table
- Commits and pushes changes to Git automatically

## Prerequisites
- [Vercel CLI](https://vercel.com/docs/cli) installed and configured
- [Yarn](https://yarnpkg.com/) installed
- Git repository initialized and connected to a remote

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/kdpuvvadi/plink
   cd plink
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

## Usage
### Add a New Short URL
```sh
yarn run add <destination-url>
```
Example:
```sh
yarn run add https://example.com
```
This generates a short URL and updates `vercel.json`. If the URL already exists, it returns the existing short URL.

### List All Short URLs
```sh
yarn run list
```
Displays all stored short URLs in a formatted table.

### Delete a Short URL
```sh
yarn run delete
```
This displays a list of existing redirects and allows you to select one to delete.

## CLI Output Examples
### Add a URL
```sh
yarn run add https://example.com
```
Output:
```
New Short URL: https://p.puvvadi.net/abcd1234
```
If the URL already exists:
```
Existing Short URL: https://p.puvvadi.net/abcd1234
```

### List URLs
```sh
yarn run list
```
Output:


```
| Index | Short URL  | Destination URL           |
|-------|------------|---------------------------|
| 1     | /abcd1234  | https://example.com       |
| 2     | /xyz56789  | https://another-site.com  |
```

### Delete a URL
```sh
yarn run delete
```
Output:
```
Select a redirect to delete:
1. /abcd1234 -> https://example.com
2. /xyz56789 -> https://another-site.com
Enter the number of the redirect to delete: 1
Deleted redirect: /abcd1234 -> https://example.com
```

## Deployment to Vercel
After modifying `vercel.json`, deploy the changes:
```sh
vercel deploy --prod
```

## Configuration
The short links are hosted at:
```sh
https://p.puvvadi.net/<short-code>
```
The base URL is defined in `shorten.js` as:
```js
const BASE_URL = "https://p.puvvadi.net";
```
Modify this if needed.

## License
This project is licensed under the MIT License.

