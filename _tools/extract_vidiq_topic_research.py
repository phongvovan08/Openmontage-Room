"""Extract keyword rows and reported credit metadata without inventing missing data."""
from pathlib import Path
import json,csv,re
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'Chu-De/research/vidiq-6-chu-de-2026-10-27.json'
data=json.loads(source.read_text(encoding='utf-8'))
rows=[];known_credits=0;unknown=[]
for entry in data['results']:
    result=entry['result'];structured=result.get('structuredContent')
    credits=(structured or {}).get('_credits',result.get('_credits'))
    if credits is None:
        for block in result.get('content',[]):
            if block.get('type')!='text':continue
            try:parsed=json.loads(block['text'])
            except (ValueError,KeyError):continue
            if isinstance(parsed,dict) and '_credits' in parsed:credits=parsed['_credits'];break
    if credits is None or credits.get('used') is None:unknown.append(entry['key'])
    else:known_credits+=credits['used']
    if entry['args'].get('mode')!='research':continue
    section='';headers=[]
    for block in result.get('content',[]):
        for line in block.get('text','').splitlines():
            if line.startswith('### '):section=line[4:];headers=[]
            if not line.startswith('|'):continue
            fields=[x.strip() for x in line.strip('|').split('|')]
            if fields[0]=='keyword':headers=fields;continue
            if not headers or re.fullmatch(r'[-: ]+',fields[0]):continue
            row=dict(zip(headers,fields));row.update(query_key=entry['key'],seed=entry['args']['keyword'],country_requested=entry['args'].get('country'),section=section,retrieved_date=data['retrievedDateLocal'])
            rows.append(row)
fields=['query_key','seed','country_requested','section','retrieved_date','keyword','volume','competition','overall','estimatedMonthlySearch','searchDemandGrowthPct','countryVolume','topMarkets (top 3)']
dest=source.with_name(source.stem+'-keywords.csv')
with dest.open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader();writer.writerows(rows)
usage={'total_research_calls':len(data['results']),'keyword_rows':len(rows),'reported_credit_usage_sum':known_credits,'calls_without_credit_usage':unknown,'total_actual_usage':None if unknown else known_credits,'note':'Only _credits.used is summed once per call; list prices or account balance differences are not treated as actual call charges.'}
source.with_name(source.stem+'-usage.json').write_text(json.dumps(usage,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(usage,ensure_ascii=True))
