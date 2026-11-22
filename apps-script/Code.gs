/**
 * Adyalathon website contact form handler (Google Apps Script).
 *
 * Bind this script to a Google Sheet (Extensions > Apps Script in the Sheet).
 * Each valid message is:
 *   1. appended as a row to the "Messages" tab of that Sheet, and
 *   2. emailed to RECIPIENT from the Google account that deploys the script.
 *
 * Settings live in Project Settings > Script properties:
 *   RECIPIENT  address that receives the emails (default: the deploying account)
 *
 * Deploy: Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * Put the resulting /exec URL in assets/js/config.js on the website.
 */

var SHEET_NAME = 'Messages';
var HEADERS = ['Received', 'Name', 'Email', 'Company', 'Topic', 'Message', 'Page'];
var MIN_FILL_MS = 3000;          // faster than this is almost certainly a bot
var MAX_PER_HOUR = 30;           // overall cap, protects the daily Gmail quota
var PER_SENDER_SECONDS = 60;     // one message per email address per minute
var LIMITS = { name: 100, email: 200, company: 150, topic: 80, message: 5000, page: 300 };

/** Run once from the editor to authorize the script and create the Messages tab. */
function setup() {
  var sheet = getSheet_();
  Logger.log('Messages tab ready: ' + sheet.getParent().getUrl());
  Logger.log('Messages will be emailed to: ' + recipient_());
  Logger.log('Mail quota left today: ' + MailApp.getRemainingDailyQuota());
}

/** Health check: opening the /exec URL in a browser shows {"ok":true}. */
function doGet() {
  return json_({ ok: true, service: 'adyalathon-contact' });
}

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Spam checks. Bots get a normal-looking "ok" so they learn nothing.
    if (clean_(p.website, 200)) return json_({ ok: true });
    var elapsed = parseInt(p.elapsed, 10);
    if (!isNaN(elapsed) && elapsed < MIN_FILL_MS) return json_({ ok: true });

    var msg = {
      name: clean_(p.name, LIMITS.name),
      email: clean_(p.email, LIMITS.email),
      company: clean_(p.company, LIMITS.company),
      topic: clean_(p.topic, LIMITS.topic),
      message: clean_(p.message, LIMITS.message),
      page: clean_(p.page, LIMITS.page)
    };

    if (!msg.name) return json_({ ok: false, error: 'Please add your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) return json_({ ok: false, error: 'Please add a valid email address.' });
    if (msg.message.length < 10) return json_({ ok: false, error: 'Please add a short message.' });

    var cache = CacheService.getScriptCache();
    var senderKey = 'sender:' + msg.email.toLowerCase();
    if (cache.get(senderKey)) return json_({ ok: false, error: 'Thanks, we already have your message. Please wait a minute before sending another.' });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var hourKey = 'hour:' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
      var count = parseInt(cache.get(hourKey) || '0', 10);
      if (count >= MAX_PER_HOUR) return json_({ ok: false, error: 'We are receiving a lot of messages right now. Please try again later.' });
      cache.put(hourKey, String(count + 1), 3600);

      getSheet_().appendRow([
        new Date(), safeCell_(msg.name), safeCell_(msg.email), safeCell_(msg.company),
        safeCell_(msg.topic), safeCell_(msg.message), safeCell_(msg.page)
      ]);
    } finally {
      lock.releaseLock();
    }
    cache.put(senderKey, '1', PER_SENDER_SECONDS);

    MailApp.sendEmail({
      to: recipient_(),
      replyTo: msg.email,
      name: 'Adyalathon website',
      subject: 'Website message from ' + msg.name + (msg.topic ? ' (' + msg.topic + ')' : ''),
      body: [
        'New message from the Adyalathon contact form.',
        '',
        'Name:    ' + msg.name,
        'Email:   ' + msg.email,
        'Company: ' + (msg.company || '-'),
        'Topic:   ' + (msg.topic || '-'),
        '',
        msg.message,
        '',
        '---',
        'Reply to this email to answer ' + msg.name + ' directly.',
        'All messages are also logged in: ' + getSheet_().getParent().getUrl()
      ].join('\n')
    });

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong on our side. Please try again later.' });
  }
}

function recipient_() {
  var r = PropertiesService.getScriptProperties().getProperty('RECIPIENT');
  return r || Session.getEffectiveUser().getEmail();
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Bind this script to a Google Sheet (Extensions > Apps Script inside the Sheet).');
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/** Stop a submitted value from being read as a spreadsheet formula. */
function safeCell_(v) {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
