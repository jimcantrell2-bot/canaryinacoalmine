#!/usr/bin/env python3
"""Check link content and review age. Availability does not verify service details."""
import argparse, concurrent.futures, datetime, html, json, re, urllib.request
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo
ROOT=Path(__file__).resolve().parents[1]
class VisibleText(HTMLParser):
    """Exclude scripts and page chrome so an empty government page is not a pass."""
    IGNORED={'head','script','style','svg','noscript','header','footer','nav'}
    def __init__(self):
        super().__init__();self.depth=0;self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag in self.IGNORED:self.depth+=1
    def handle_endtag(self,tag):
        if tag in self.IGNORED and self.depth:self.depth-=1
    def handle_data(self,text):
        if not self.depth:self.parts.append(text)
def classify_page(title,raw,known_interactive=False):
    parser=VisibleText();parser.feed(raw)
    length=len(re.sub(r'\s+',' ',' '.join(parser.parts)).strip())
    suspect=bool(re.search(r'access denied|just a moment|page not found|404 not found|verify you are human',title,re.I))
    if suspect or not title:return 'needs-review',length
    if length<120:return ('interactive-not-tested' if known_interactive else 'needs-review'),length
    return 'reachable',length

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report',type=Path,required=True)
    args=parser.parse_args()
    data=json.loads((ROOT/'pigeon/resources.json').read_text())
    urls=set(data['additionalLinks'].values())
    interactive=set()
    for resource in data['resources'].values():
        urls.add(resource['url']);urls.update(resource['sources'])
        if resource.get('fallback'):urls.add(resource['fallback']['url'])
        if resource.get('requiresJavaScript') and resource.get('fallback'):interactive.add(resource['url'])
    def check(url):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'CherAmiResourceReview/1.0'})
            with urllib.request.urlopen(req,timeout=20) as response:
                raw=response.read(2500000).decode('utf-8',errors='replace')
                title=re.search(r'<title[^>]*>(.*?)</title>',raw,re.I|re.S)
                title=html.unescape(re.sub(r'\s+',' ',title.group(1))).strip() if title else ''
                result,length=classify_page(title,raw,url in interactive)
                return {'url':url,'status':response.status,'finalUrl':response.url,'title':title,'visibleTextCharacters':length,'result':result}
        except Exception as exc:
            return {'url':url,'status':getattr(exc,'code',None),'result':'needs-review','error':str(exc)}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(check,sorted(urls)))
    today=datetime.datetime.now(ZoneInfo('America/New_York')).date()
    overdue=[key for key,r in data['resources'].items() if datetime.date.fromisoformat(r['reviewDue'])<=today]
    report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'HTTP availability, visible page-content checks and source-review age. Does not verify service details, calls, text messaging, chats, searches, applications or openings. Declared JavaScript searches with reviewed fallback links are marked interactive-not-tested.','overdueResources':overdue,'links':results}
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,indent=2)+'\n')
    for result in results:
        if result['result']!='reachable':print(result['result'],result.get('status'),result['url'],result.get('error',result.get('title')))
    failures=sum(r['result']=='needs-review' for r in results)
    untested=sum(r['result']=='interactive-not-tested' for r in results)
    print(f'{len(results)} links checked; {failures} need review; {untested} interactive searches untested; {len(overdue)} source reviews due.')
    return 1 if failures or overdue else 0
if __name__=='__main__':raise SystemExit(main())
