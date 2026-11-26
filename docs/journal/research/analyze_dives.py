import json, collections, statistics, math, csv
from datetime import date
D=json.load(open('/home/ubuntu/dives.json'))
# valid temp same rules as repo
def valid(t): return isinstance(t,(int,float)) and 20<=t<=33
# monthly temp, all data
mt=collections.defaultdict(list)
md=collections.defaultdict(set)
years=collections.Counter(d['date'][:4] for d in D)
for d in D:
    m=int(d['date'][5:7])
    if valid(d.get('waterTemperature')):
        mt[m].append(d['waterTemperature']); md[m].add(d['id'])
print('date range',D[-1]['date'],D[0]['date'],'dives',len(D),'years',years)
print('\nMonthly temperatures C across all years (valid readings):')
for m in range(1,13):
    xs=mt[m]
    if xs: print(m, round(statistics.mean(xs),1), round(min(xs),1), round(max(xs),1), 'n',len(xs))
# complete year comparisons 2024,2025
print('\nYearly summaries')
for y in ['2024','2025','2026']:
    ds=[d for d in D if d['date'].startswith(y)]
    temps=[d['waterTemperature'] for d in ds if valid(d.get('waterTemperature'))]
    print(y,'dives',len(ds),'sites',len(set(d['diveSiteId'] for d in ds)),'tempavg',round(statistics.mean(temps),1) if temps else None,'tempn',len(temps))
# top sites overall + complete-year 2024-25 combined
for label, ds in [('all',D),('2024-25',[d for d in D if d['date'][:4] in ('2024','2025')])]:
    c=collections.Counter(d['diveSite'] for d in ds)
    print('\nTop sites',label)
    for site,n in c.most_common(15): print(site,n)
# animal metrics per year/season. names exact. count sum and dives with at least one.
groups={
 'turtles':lambda n:'Turtle' in n,
 'sharks':lambda n:'Shark' in n,
 'nurse sharks':lambda n:n=='Atlantic Nurse Shark',
 'reef sharks':lambda n:n=='Caribbean Reef Shark',
 'green turtles':lambda n:n=='Green Turtle',
 'hawksbill turtles':lambda n:n=='Hawksbill Turtle',
}
print('\nAnimal metrics all data')
for label,fn in groups.items():
    cnt=0; dives=0
    for d in D:
        x=sum((s.get('count') or 1) for s in d.get('sightings',[]) if fn(s['speciesName']))
        cnt+=x; dives+=x>0
    print(label,'sightings',cnt,'dives_with',dives,'pct_dives',round(100*dives/len(D),1))
print('\nAnimal metrics complete years 2024/2025')
for y in ['2024','2025']:
 ds=[d for d in D if d['date'].startswith(y)]
 print('year',y)
 for label,fn in groups.items():
    cnt=0; dives=0
    for d in ds:
        x=sum((s.get('count') or 1) for s in d.get('sightings',[]) if fn(s['speciesName']))
        cnt+=x; dives+=x>0
    print(' ',label,'sightings',cnt,'dives_with',dives,'pct',round(100*dives/len(ds),1))
# seasonal shark/turtle frequency by quarter using all years
print('\nQuarterly encounter rates and per-dive mean count')
for q,months in [('Jan-Mar',[1,2,3]),('Apr-Jun',[4,5,6]),('Jul-Sep',[7,8,9]),('Oct-Dec',[10,11,12])]:
 ds=[d for d in D if int(d['date'][5:7]) in months]
 print(q,'dives',len(ds))
 for label,fn in [('turtles',groups['turtles']),('sharks',groups['sharks'])]:
    cnt=0; dives=0
    for d in ds:
        x=sum((s.get('count') or 1) for s in d.get('sightings',[]) if fn(s['speciesName']))
        cnt+=x; dives+=x>0
    print(' ',label,'sightings',cnt,'dives_with_pct',round(100*dives/len(ds),1) if ds else 0,'mean_per_dive',round(cnt/len(ds),2) if ds else 0)
# area mapping manual from dive-site-videos data order/areas recreated from names using site -> area present in dives? no area in D. use static mapping parse rough
