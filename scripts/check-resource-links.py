#!/usr/bin/env python3
"""Check links and review age. HTTP success does not verify service details."""
import argparse, concurrent.futures, datetime, html, json, re, urllib.request, urllib.error
from pathlib import Path
from zoneinfo import ZoneInfo
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--report', type=Path, required=True)
args=p.parse_args()
data=json.loads((ROOT/'pigeon/resources.json').read_text())
urls=set(data['additionalLinks'].values())
for r in data['resources'].values():urls.add(r['url']);urls.update(r['sources'])
def check(url):
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'CherAmiResourceReview/1.0'})
  with urllib.request.urlopen(req,timeout=20) as response:
   raw=response.read(2000000).decode('utf-8',errors='replace')
   title=re.search(r'<title[^>]*>(.*?)</title>',raw,re.I|re.S)
   title=html.unescape(re.sub(r'\s+',' ',title.group(1))).strip() if title else ''
   suspect=bool(re.search(r'access denied|just a moment|page not found|404 not found|verify you are human',title,re.I))
   return {'url':url,'status':response.status,'finalUrl':response.url,'title':title,'result':'needs-review' if suspect or not title else 'reachable'}
 except Exception as exc:
  return {'url':url,'status':getattr(exc,'code',None),'result':'needs-review','error':str(exc)}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(check,sorted(urls)))
today=datetime.datetime.now(ZoneInfo('America/New_York')).date()
overdue=[key for key,r in data['resources'].items() if datetime.date.fromisoformat(r['reviewDue'])<=today]
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'HTTP availability and source-review age only; not service accuracy or a test of calls, chat, search or applications.','overdueResources':overdue,'links':results}
args.report.parent.mkdir(parents=True,exist_ok=True)
args.report.write_text(json.dumps(report,indent=2)+'\n')
for r in results:
 if r['result']!='reachable':print(r['result'],r.get('status'),r['url'],r.get('error',r.get('title')))
print(f'{len(results)} links checked; {sum(r["result"]!="reachable" for r in results)} need review; {len(overdue)} source reviews due.')
raise SystemExit(1 if overdue or any(r['result']!='reachable' for r in results) else 0)
