// Giải mã QR ở luồng riêng để camera và giao diện không bị giật
importScripts('vendor/jsQR.js');
onmessage = e => {
  const { buf, w, h, inv } = e.data;
  const r = jsQR(new Uint8ClampedArray(buf), w, h, { inversionAttempts: inv ? 'attemptBoth' : 'dontInvert' });
  postMessage({ data: r && r.data ? r.data : null });
};
