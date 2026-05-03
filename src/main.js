import './style.css'

// State
let writeMode = 'url'; // 'url' or 'text'
let scanAbortController = null;
let isScanning = false;

// DOM Elements
const tabUrl = document.getElementById('tabUrl');
const tabText = document.getElementById('tabText');
const payloadInput = document.getElementById('payloadInput');
const btnWrite = document.getElementById('btnWrite');
const btnStop = document.getElementById('btnStop');
const actionDesc = document.getElementById('actionDesc');
const alertBanner = document.getElementById('alertBanner');
const alertMessage = document.getElementById('alertMessage');

// Initialize
function init() {
  if (!window.isSecureContext) {
    showAlert('web nfc requires https or localhost. if testing on mobile, use port forwarding.', 'error');
    btnWrite.disabled = true;
  } else if (!('NDEFReader' in window)) {
    showAlert('web nfc is not supported on this device. please use chrome on android.', 'error');
    btnWrite.disabled = true;
  }

  // Tabs
  tabUrl.addEventListener('click', () => setMode('url'));
  tabText.addEventListener('click', () => setMode('text'));

  // Actions
  btnWrite.addEventListener('click', handleWrite);
  btnStop.addEventListener('click', stopScanning);
}

function setMode(mode) {
  writeMode = mode;
  if (mode === 'url') {
    tabUrl.className = 'flex-1 py-2 bg-teal-600 text-white transition-colors flex justify-center items-center';
    tabText.className = 'flex-1 py-2 bg-white text-teal-600 hover:bg-teal-50 transition-colors flex justify-center items-center';
    payloadInput.placeholder = 'https://example.com';
    if (payloadInput.value === 'hello world') payloadInput.value = 'https://example.com';
  } else {
    tabText.className = 'flex-1 py-2 bg-teal-600 text-white transition-colors flex justify-center items-center';
    tabUrl.className = 'flex-1 py-2 bg-white text-teal-600 hover:bg-teal-50 transition-colors flex justify-center items-center';
    payloadInput.placeholder = 'hello world';
    if (payloadInput.value === 'https://example.com') payloadInput.value = 'hello world';
  }
}

function showAlert(msg, type = 'info') {
  alertBanner.classList.remove('hidden', 'border-red-500', 'border-teal-500');
  
  if (type === 'error') {
    alertBanner.className = 'bg-red-50 p-4';
    alertMessage.className = 'text-red-700 text-sm font-medium';
  } else {
    alertBanner.className = 'bg-teal-50 p-4';
    alertMessage.className = 'text-teal-700 text-sm font-medium';
  }
  
  alertMessage.textContent = msg.toLowerCase();
}

function hideAlert() {
  alertBanner.classList.add('hidden');
}

function updateUIStatus(scanning, title, desc) {
  isScanning = scanning;
  actionDesc.textContent = desc.toLowerCase();
  
  if (scanning) {
    btnWrite.classList.add('hidden');
    btnStop.classList.remove('hidden');
    actionDesc.classList.add('animate-pulse');
  } else {
    btnWrite.classList.remove('hidden');
    btnStop.classList.add('hidden');
    actionDesc.classList.remove('animate-pulse');
  }
}

function describeNfcError(err) {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return "nfc permission denied — allow it in chrome and try again.";
      case "NotSupportedError":
        return "this tag doesn't support ndef — try a different tag.";
      case "NetworkError":
        return "couldn't interact with tag. hold it still and retry.";
      case "AbortError":
        return "operation cancelled.";
      case "InvalidStateError":
        return "nfc is busy — stop any ongoing scan first.";
    }
    return err.message || `failed (${err.name})`;
  }
  return err.message || "couldn't interact with tag";
}

function stopScanning() {
  if (scanAbortController) {
    scanAbortController.abort();
    scanAbortController = null;
  }
  updateUIStatus(false, 'ready to write', 'tap below to scan');
  hideAlert();
}

async function handleWrite() {
  const payload = payloadInput.value.trim();
  if (!payload) {
    showAlert('please enter a payload.', 'error');
    return;
  }

  hideAlert();
  
  try {
    const ndef = new NDEFReader();
    updateUIStatus(true, 'ready to write', 'hold phone near tag...');
    
    scanAbortController = new AbortController();
    const signal = scanAbortController.signal;

    const records = [{ recordType: writeMode, data: payload }];
    await ndef.write({ records }, { signal });
    
    updateUIStatus(false, 'success', 'tag programmed.');
    showAlert('successfully wrote to nfc tag!', 'success');
  } catch (err) {
    updateUIStatus(false, 'failed', 'error occurred while writing.');
    showAlert(describeNfcError(err), 'error');
  } finally {
    scanAbortController = null;
  }
}

// Start
init();

