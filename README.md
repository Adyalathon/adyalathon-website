# Adyalathon website

Source for the Adyalathon company website. Plain HTML, CSS and a little JavaScript, hosted on GitHub Pages. No build step: edit a file, commit, and Pages republishes.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Home |
| `about.html` | About & Services |
| `contact.html` | Contact form |
| `404.html` | Not-found page |
| `assets/css/style.css` | All styles. Colors come from the logo (slate `#384953`, cream `#FAEAD3`) |
| `assets/js/site.js` | Light/dark toggle and footer year |
| `assets/js/contact.js` | Sends the contact form to the Apps Script web app |
| `assets/js/config.js` | `FORM_ENDPOINT`: the Apps Script `/exec` URL |
| `assets/img/` | Logo and icons |
| `apps-script/` | The Google Apps Script that emails and logs contact messages, with deploy steps |

Text marked with the `placeholder` class (striped highlight on the page) is still waiting for real copy.

## Preview locally

```powershell
cd D:\path\to\adyalathon-website
python -m http.server 8000
Start-Process http://localhost:8000
```

## Custom domain

The site is served at `https://jtdyal.github.io/adyalathon-website/` until adyalathon.com is switched over. The switch (a `CNAME` file here plus DNS records at Squarespace) is a separate, deliberate step.
