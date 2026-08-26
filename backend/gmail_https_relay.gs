/**
 * Gmail HTTPS relay for Render (SMTP ports are blocked on Render free).
 *
 * Setup:
 * 1. Open https://script.google.com and create a new project.
 * 2. Paste this file, then Project Settings → Script properties:
 *    WEBHOOK_SECRET = a long random string (same as EMAIL_WEBHOOK_SECRET on Render)
 * 3. Deploy → New deployment → Type: Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 4. Copy the web app URL into Render env EMAIL_HTTPS_WEBHOOK
 *    and set EMAIL_WEBHOOK_SECRET to the same secret.
 */
function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput("invalid json");
  }

  var expected = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  if (!expected || data.secret !== expected) {
    return ContentService.createTextOutput("unauthorized");
  }

  if (!data.to || !data.subject) {
    return ContentService.createTextOutput("missing fields");
  }

  MailApp.sendEmail({
    to: String(data.to),
    subject: String(data.subject),
    htmlBody: String(data.html || ""),
    name: "LinktoCompany",
  });

  return ContentService.createTextOutput("ok");
}
