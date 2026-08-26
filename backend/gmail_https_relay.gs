/**
 * Gmail HTTPS relay for LinktoCompany (SIH 2026)
 * Supports both GET and POST web requests to avoid 405 redirect errors.
 */

function doGet(e) {
  return handleEmail(e ? e.parameter : {});
}

function doPost(e) {
  var params = {};
  if (e && e.postData && e.postData.contents) {
    try {
      params = JSON.parse(e.postData.contents);
    } catch(err) {
      params = e.parameter || {};
    }
  } else if (e && e.parameter) {
    params = e.parameter;
  }
  return handleEmail(params);
}

function handleEmail(data) {
  if (!data || !data.to || !data.subject) {
    return ContentService.createTextOutput("missing fields");
  }

  try {
    MailApp.sendEmail({
      to: String(data.to),
      subject: String(data.subject),
      htmlBody: String(data.html || ""),
      name: "LinktoCompany"
    });
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.toString());
  }
}
