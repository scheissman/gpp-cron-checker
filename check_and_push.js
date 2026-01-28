import fs from 'fs';
import { getHashes } from './gpp_hash_check.js';

const STATE_FILE = './state.json';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_TOKEN = process.env.EXPO_PUSH_TOKEN;

const oldState = fs.existsSync(STATE_FILE)
  ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  : {};

const newState = await getHashes();

let changed = false;
let messages = [];

for (const type of Object.keys(newState)) {
  if (!oldState[type] || oldState[type].hash !== newState[type].hash) {
    if (oldState[type]) {
      changed = true;
      messages.push(
        `${type.toUpperCase()} promjena (${oldState[type].hash} → ${newState[type].hash})`
      );
    }
  }
}

if (changed && EXPO_TOKEN) {
  console.log('🔔 Sending push');

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: EXPO_TOKEN,
      title: 'GPP raspored promijenjen',
      body: messages.join('\n')
    })
  });
} else {
  console.log('No changes');
}

// spremi novo stanje
fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
