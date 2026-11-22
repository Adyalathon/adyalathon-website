# Adyalathon website — notes for Claude

Company website for Adyalathon, John's sole proprietorship. Plain static HTML/CSS/JS with no build step, hosted on GitHub Pages from `main` at the repo root.

- Repo: https://github.com/Adyalathon/adyalathon-website. Use the company GitHub account for this repo, never the personal jtdyal account. Don't add jtdyal as a collaborator.
- Preview once Pages is on: https://adyalathon.github.io/adyalathon-website/
- Give command examples in PowerShell (pwsh).

## Status (2026-11-22)

Done:
- Home (`index.html`), About & Services (`about.html`), Contact (`contact.html`) and a 404 page.
- Colors come from the Adyalathon logo: slate `#384953` and cream `#FAEAD3`. The site has light and dark mode.
- The copy reuses the old Squarespace starter page (tagline "Building the Bridge Between Business and AI", "Our approach", "Who we work with") plus John's own description of the business. Don't invent clients, numbers or testimonials.
- Contact form back end in `apps-script/` (Google Apps Script bound to a Sheet). It logs each message and emails it, with a honeypot, a minimum fill time and rate limits. Deploy steps are in `apps-script/README.md`.

Open:
1. Push to the repo and turn on Pages (branch `main`, path `/`).
2. John deploys the Apps Script and puts the `/exec` URL in `assets/js/config.js` as `FORM_ENDPOINT`. Then test the form end to end.
3. Recipient address for form messages. By default they go to the Google account that deploys the script; to change that, set the `RECIPIENT` script property.
4. Replace the highlighted placeholders (class `placeholder`) on `about.html` with John's own "Who we are" text. Remove the class once the real copy is in.
5. Decide whether to add a past work page.
6. Domain: adyalathon.com is registered at Squarespace and still shows the Squarespace page. Switch it only when John says so: add a `CNAME` file containing `adyalathon.com`, set the custom domain in Pages settings, update DNS at Squarespace to the GitHub Pages A/AAAA records plus a `www` CNAME to `adyalathon.github.io`, then turn on Enforce HTTPS.
