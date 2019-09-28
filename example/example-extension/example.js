const data = chrome.runtime.getManifest();
document.body.setAttribute('data-name', data.name);
document.body.setAttribute('data-version', data.version);
document.body.setAttribute('data-description', data.description);
document.body.setAttribute('data-id', chrome.runtime.id);
