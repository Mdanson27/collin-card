'use strict';

const loader = document.getElementById('loader');
const toast = document.getElementById('toast');
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

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function typeIntroduction(element, value, delayMs) {
  if (!element) return;
  element.textContent = '';
  for (const char of value) {
    element.textContent += char;
    await sleep(char === ' ' ? delayMs * .55 : delayMs);
  }
}

async function runIntroduction() {
  const roleText = document.getElementById('introRoleText');
  const nameText = document.getElementById('introNameText');
  if (!loader || !roleText || !nameText) {
    finishLoading();
    return;
  }

  // Respect accessibility preferences: avoid lengthy animated typing.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    roleText.textContent = 'Managing Director';
    nameText.textContent = 'Namanya Obed Collins';
    loader.classList.add('is-typing-name', 'is-complete');
    await sleep(320);
    finishLoading();
    return;
  }

  // Title first, then his full name, with a brief elegant final hold.
  await sleep(240);
  await typeIntroduction(roleText, 'Managing Director', 57);
  await sleep(270);
  loader.classList.add('is-typing-name');
  await typeIntroduction(nameText, 'Namanya Obed Collins', 66);
  loader.classList.add('is-complete');
  await sleep(720);
  finishLoading();
}
runIntroduction().catch(finishLoading);
// Safety cap: never trap visitors on the splash screen.
window.setTimeout(finishLoading, 5000);

// Bring the portrait into the browser cache in parallel with the introduction.
const portrait = document.querySelector('.portrait');
if (portrait && !portrait.complete) {
  portrait.loading = 'eager';
}

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
