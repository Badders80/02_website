import { google } from "googleapis";
import path from "path";
import fs from "fs";

const SPREADSHEET_ID = "1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg";

function getGoogleAuthClient() {
  const tokenPath = path.join(process.cwd(), "scripts", "token.json");
  if (fs.existsSync(tokenPath)) {
    const creds = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    const oauth2Client = new google.auth.OAuth2(
      creds.client_id,
      creds.client_secret,
      creds.token_uri
    );
    oauth2Client.setCredentials({
      refresh_token: creds.refresh_token,
      access_token: creds.token,
    });
    return oauth2Client;
  }
  throw new Error("No token.json found");
}

async function main() {
  const auth = getGoogleAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  console.log("Sheet tabs in spreadsheet:");
  const sheetNames = meta.data.sheets?.map(s => s.properties?.title) || [];
  console.log(sheetNames);

  for (const name of sheetNames) {
    if (!name) continue;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${name}!1:1`,
    });
    console.log(`Headers for tab "${name}":`, res.data.values?.[0] || []);
  }
}

main().catch(console.error);
