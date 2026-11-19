'use strict';

const loader = document.getElementById('loader');
const toast = document.getElementById('toast');
const startTime = performance.now();
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2000);
}

function finishLoading() {
  if (!loader || loader.classList.contains('is-hidden')) return;
  loader.classList.add('is-hidden');
  loader.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('loading');
}

function finishAfterMinimum() {
  const remaining = Math.max(0, 1800 - (performance.now() - startTime));
  window.setTimeout(finishLoading, remaining);
}

const portrait = document.querySelector('.portrait');
if (portrait && !portrait.complete) {
  portrait.addEventListener('load', finishAfterMinimum, { once: true });
  portrait.addEventListener('error', finishAfterMinimum, { once: true });
} else {
  finishAfterMinimum();
}
// Never leave the profile hidden if an image request stalls.
window.setTimeout(finishLoading, 2800);

const contactLines = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Namanya;Obed Collins;;;',
  'FN:Namanya Obed Collins',
  'ORG:Qbranch Uganda Limited',
  'TITLE:Managing Director',
  'TEL;TYPE=CELL,VOICE:+256784159952',
  'TEL;TYPE=CELL,WHATSAPP:+256784159952',
  'EMAIL;TYPE=INTERNET,WORK:obedcollinsnamanya@gmail.com',
  'URL:https://www.qbranch.co.ug/',
  'ADR;TYPE=WORK:;;Plot 47/49\, Uganda Cooperative Alliance Building\, Nkrumah Road;Kampala;;;Uganda',
  'NOTE:11 years of experience as Managing Director. Bringing Life to Technology.',
  'END:VCARD'
];

function saveContact() {
  const blob = new Blob([contactLines.join('\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Namanya-Obed-Collins.vcf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  showToast('Contact card ready');
}
document.getElementById('saveContact')?.addEventListener('click', saveContact);
document.getElementById('saveContactBottom')?.addEventListener('click', saveContact);

function copyFallback(value) {
  const field = document.createElement('textarea');
  field.value = value;
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.appendChild(field);
  field.focus();
  field.select();
  const success = document.execCommand('copy');
  field.remove();
  return success;
}

document.getElementById('shareBtn')?.addEventListener('click', async () => {
  const url = window.location.href.split('#')[0];
  const data = {
    title: 'Namanya Obed Collins | Qbranch Uganda Limited',
    text: 'Meet Namanya Obed Collins, Managing Director at Qbranch Uganda Limited.',
    url
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      showToast('Profile link copied');
      return;
    }
    showToast(copyFallback(url) ? 'Profile link copied' : 'Use your browser share menu');
  } catch (error) {
    if (error?.name !== 'AbortError') showToast('Unable to share right now');
  }
});
