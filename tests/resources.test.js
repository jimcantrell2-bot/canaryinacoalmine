const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'pigeon/resources.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'pigeon/index.html'), 'utf8');

test('all published resources have dated evidence and a next review date', () => {
  const references = [...data.categories.flatMap(c => c.resources), ...data.nycResources, ...Object.values(data.lgbtqResources || {}).flat(), data.localResource];
  assert.deepEqual([...new Set(references)].sort(), Object.keys(data.resources).sort());
  for (const [id, r] of Object.entries(data.resources)) {
    assert.ok(r.sources.length, id);
    assert.ok(Date.parse(r.reviewDue) > Date.parse(r.reviewedOn), id);
    for (const url of [r.url, ...r.sources]) assert.equal(new URL(url).protocol, 'https:', id);
    if (r.phone) {
      const digits = r.phone.number.replace(/\D/g, '');
      const displayed = r.phone.label.replace(/\D/g, '');
      assert.ok(displayed.includes(digits) || (digits.length === 11 && digits.startsWith('1') && displayed.includes(digits.slice(1))), id);
    }
    assert.ok(html.includes(`data-resource="${id}"`), id);
  }
});

test('safety-critical contact routes retain their reviewed numbers and instructions', () => {
  assert.equal(data.resources.hotline.phone.number, '+18007997233');
  assert.equal(data.resources.hotline.text, 'Text START to 88788');
  assert.equal(data.resources['crisis-text'].text, 'Text HOME to 741741');
  assert.equal(data.resources.veterans.phone.number, '988');
  assert.match(data.resources.veterans.phone.label, /press 1/);
  assert.equal(data.resources.veterans.text, 'Text 838255');
  assert.equal(data.resources['nyc-hope'].phone.number, '+18006214673');
});

test('known misleading claims do not return', () => {
  assert.doesNotMatch(html, /Call or text 211|always confidential|Resources verified May|Verified free help|She delivered|saved 194/i);
  assert.notEqual(data.resources.medicare.url, data.resources.medicaid.url);
  assert.notEqual(data.resources.ssdi.url, data.resources.ssi.url);
  assert.match(data.resources.nfcc.detail, /fees/);
  assert.match(data.resources.divorce.description, /Christian/);
  assert.match(data.resources.divorce.detail, /fee/);
  assert.match(data.resources.grief.detail, /fees/);
  assert.equal(data.resources.childcare.phone, undefined);
});

test('DV leads the resources; NYC has its own section after national resources', () => {
  assert.equal(data.categories[0].id, 'domestic-violence');
  const dv = html.indexOf('id="domestic-violence"');
  const national = html.indexOf('id="national-resources"');
  const nyc = html.indexOf('id="nyc-help"');
  assert.ok(dv < national && national < nyc);
  assert.ok(data.nycResources.every(id => html.indexOf(`data-resource="${id}"`) > nyc));
  assert.doesNotMatch(html, /target="_blank"/);
});
