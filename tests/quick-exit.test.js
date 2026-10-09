const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../pigeon/index.html'), 'utf8');

function setup() {
  const handlers = {};
  const navigations = [];
  const context = {
    window: { location: { replace: url => navigations.push(url) } },
    document: {
      getElementById: () => ({ addEventListener: (name, fn) => { handlers[name] = fn; } }),
      addEventListener: (name, fn) => { handlers[name] = fn; }
    }
  };
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  return { handlers, navigations };
}

test('one Escape navigates immediately; other keys do not', () => {
  const { handlers, navigations } = setup();
  let prevented = false;
  handlers.keydown({ key: 'Enter', preventDefault() {} });
  assert.equal(navigations.length, 0);
  handlers.keydown({ key: 'Escape', preventDefault() { prevented = true; } });
  assert.deepEqual(navigations, ['https://www.google.com/']);
  assert.equal(prevented, true);
});

test('click replaces the current entry without opening another tab', () => {
  const { handlers, navigations } = setup();
  let prevented = false;
  handlers.click({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.deepEqual(navigations, ['https://www.google.com/']);
});

test('native link still works without scripts and DV links stay in this tab', () => {
  const anchor = html.match(/<a[^>]+id="quick-exit"[^>]*>/)[0];
  assert.match(anchor, /href="https:\/\/www.google.com\/"/);
  assert.doesNotMatch(anchor, /target=/);
  assert.match(html, /<noscript>[\s\S]*Escape shortcut is unavailable/);
  const card = html.split('id="domestic-violence"')[1].split('</section>')[0];
  assert.doesNotMatch(card, /target="_blank"/);
  assert.match(card, /does not erase browsing history/);
  assert.doesNotMatch(card, /removes it from your back button/);
});
