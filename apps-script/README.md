# Contact form back end (Google Apps Script)

The website's contact form posts to this script. Each message is logged to a Google Sheet and emailed to you from your Google Workspace account. Nothing else is needed: no server, no paid form service.

## Deploy (about 5 minutes)

1. In Google Drive, create a new Google Sheet named **Adyalathon website messages**.
2. In that Sheet, open **Extensions > Apps Script**.
3. Replace everything in `Code.gs` with the contents of [`Code.gs`](Code.gs) from this folder, then save.
4. Optional: to send messages somewhere other than the account you're signed in as, open **Project Settings > Script properties**, add `RECIPIENT` with the address you want.
5. In the function menu choose **setup**, click **Run**, and approve the permission prompts (Sheets, Gmail send, script cache). The log shows the Sheet link and the recipient address.
6. Click **Deploy > New deployment**, choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
7. Copy the **Web app URL** (it ends in `/exec`) and send it to Claude, or paste it into `assets/js/config.js` as `FORM_ENDPOINT`.

To check it's live, open the `/exec` URL in a browser. It should show `{"ok":true,...}`.

## Updating the script later

Edit the code, then **Deploy > Manage deployments > (pencil) Edit > Version: New version > Deploy**. Editing the existing deployment keeps the same URL, so the website doesn't need to change.

## Spam protection

- A hidden honeypot field (`website`) that people never see. Bots that fill it get a fake "ok".
- Forms submitted less than 3 seconds after the page loads are dropped the same way.
- One message per email address per minute, and at most 30 messages an hour overall, which keeps you well inside Gmail's daily sending quota.
- Submitted text that starts with `=`, `+`, `-` or `@` is stored as plain text so it can't run as a spreadsheet formula.
