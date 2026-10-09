#!/usr/bin/env python3
"""Render the static directory from manually reviewed resource records. No network."""
from pathlib import Path
from html import escape
import json, sys, datetime
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'pigeon/resources.json').read_text())
resources=data['resources']
def e(text):return escape(text,quote=True)
def resource(key):
 r=resources[key]
 contacts=''
 if 'phone' in r:
  p=r['phone'];contacts+=f'<a class="hotline" href="tel:{e(p["number"])}">{e(p["label"])}</a>'
 if 'text' in r:contacts+=f'<span class="text-contact">{e(r["text"])}</span>'
 sources=''.join(f'<a href="{e(url)}" rel="noreferrer">{e(url)}</a>' for url in r['sources'])
 return f'''<li data-resource="{e(key)}"><span class="resource-name">{e(r['name'])}</span><p class="resource-line">{e(r['description'])}</p><p class="resource-detail">{e(r['detail'])}</p><div class="contact-line">{contacts}</div><a class="resource-link" href="{e(r['url'])}" rel="noreferrer">{e(r['linkLabel'])}</a><details class="resource-source"><summary>Source · checked {e(r['reviewedOn'])}</summary>{sources}</details></li>'''
def category(c,priority=False):
 extra=' priority-card' if priority else ''
 body=''.join(resource(k) for k in c['resources'])
 safety=''
 if priority:
  safety='''<p class="exit-note"><strong>Need to leave?</strong> Quick Exit or one press of Escape opens Google in this tab. It does not erase browsing history, earlier visits, other tabs, or call and text records. Private browsing does not prevent device monitoring. If you suspect monitoring, consider using a safer device. <a href="https://www.thehotline.org/plan-for-safety/internet-safety/" rel="noreferrer">Internet safety guidance</a> · <a href="https://www.thehotline.org/plan-for-safety/" rel="noreferrer">Safety planning</a>.</p><noscript><p class="exit-note">JavaScript is off: use the Quick Exit link; the Escape shortcut is unavailable.</p></noscript>'''
 return f'''<section class="crisis-card{extra}" id="{e(c['id'])}" aria-labelledby="heading-{e(c['id'])}"><div class="crisis-card-header"><span class="crisis-icon" aria-hidden="true">{c['icon']}</span><h2 class="crisis-title" id="heading-{e(c['id'])}">{e(c['title'])}</h2></div><ul class="crisis-resources">{body}</ul>{safety}</section>'''
parts=[category(data['categories'][0],True)]
parts.append('<section id="national-resources" aria-labelledby="national-heading"><h2 class="section-heading" id="national-heading">U.S. resources</h2><p class="section-intro">Choose the kind of help you need. For local options or help getting started, call 211.</p>')
parts.append('<div class="local-help"><ul class="crisis-resources">'+resource(data['localResource'])+'</ul></div>')
parts.append('<details class="topic-list"><summary>Jump to a topic</summary><div class="jump-links">'+''.join(f'<a href="#{e(c["id"])}">{e(c["title"])}</a>' for c in data['categories'][1:])+'</div></details>')
parts.append('<div class="crisis-grid">'+''.join(category(c) for c in data['categories'][1:])+'</div></section>')
parts.append('<section class="nyc-section" id="nyc-help" aria-labelledby="nyc-heading"><h2 class="section-heading" id="nyc-heading">New York City help</h2><p class="section-intro">Official city resources for the five boroughs. Local eligibility and intake rules apply.</p><div class="crisis-grid">')
for key in data['nycResources']:
 parts.append(f'<div class="crisis-card"><ul class="crisis-resources">{resource(key)}</ul></div>')
parts.append('</div></section>')
output=(ROOT/'pigeon/template.html').read_text().replace('<!-- DIRECTORY -->','\n'.join(parts)).replace('@@REVIEW_DATE@@',datetime.date.fromisoformat(data['reviewedOn']).strftime('%B %d, %Y').replace(' 0',' '))
path=ROOT/'pigeon/index.html'
if '--check' in sys.argv:
 if path.read_text()!=output:raise SystemExit('Resource page is out of date. Run scripts/build-resources.py.')
 print('Resource page matches reviewed data.')
else:
 path.write_text(output)
 print(f'Rendered {len(resources)} unique resources.')
