from pathlib import Path
import json,gzip,hashlib,collections,csv,statistics,math
HERE=Path(__file__).resolve().parent;ROOT=HERE.parent/'route-trace'/'baseline-phase0'
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
def counter(rows):return dict(collections.Counter(r['outcome']['kind'] for r in rows))
def group(rows):return {'balls':len(rows),'outcomes':counter(rows),'ids':[r['ballId'] for r in rows]}
def key(part):return f"pin:{part['id']}" if part['kind']=='pin' else f"{part['kind']}:{part.get('role',part.get('index',''))}"
def fixedkey(part):return json.dumps({k:part.get(k) for k in ['a','b','r','role']},sort_keys=True)
rawmanifest=json.loads((ROOT/'raw-manifest.json').read_text())[0];rawbytes=(ROOT/'result.json.gz').read_bytes();assert hashlib.sha256(rawbytes).hexdigest()==rawmanifest['compressedSHA'];expanded=gzip.decompress(rawbytes);assert hashlib.sha256(expanded).hexdigest()==rawmanifest['expandedSHA'];raw=json.loads(expanded);del expanded,rawbytes
summary=json.loads((ROOT/'trace-summary.json').read_text());manifest=json.loads((ROOT/'trace-manifest.json').read_text());prov=json.loads((ROOT/'provenance.json').read_text());oracle=json.loads((ROOT/'oracle-comparison.json').read_text());assert prov['success'] and prov['sourceUnchanged'] and prov['gitUnchanged'] and prov['commit']==prov['endCommit'];assert oracle['allExistingMeasurementFieldsExact'];assert raw['sourceSHA']==manifest['sourceSHA']==prov['endSourceSHA'];assert digest(ROOT/'trace.jsonl.gz')==manifest['compressedSHA']
obs={r['ballId']:r for r in raw['s8ShotObservation']['rows']};expected={r['ballId']:r for r in summary['balls']};shots=[e for e in raw['events'] if e['type']=='shot'];assert len(shots)==250
balls={e['ballId']:{'ballId':e['ballId'],'shotTime':e['time'],'crosses':[],'pinChanged':set(),'pinImpulse':set(),'trayChanged':0,'trayVelocityChanged':0,'trayPositionOnly':0,'trayIndices':set(),'windmillChanged':0,'windmillImpulse':0,'firstWindmillTime':None,'last':None,'lastVelocity':None,'gateBefore':None,'gateAfter':None,'outcome':None,'nearestFrontWindmillPoint':None} for e in shots}
indices={fixedkey(c):i for i,c in enumerate(raw['fixed']['colliders'])};types=collections.Counter();contactCounts=collections.Counter();expandedHash=hashlib.sha256();expandedBytes=lines=0
def nearest(point,time,stage):
 if not point or not point['front']:return
 b=balls[point['id']];m=raw['fixed']['mechanisms'][0];distance=math.hypot(point['x']-m['x'],point['y']-m['y'])
 if b['nearestFrontWindmillPoint'] is None or distance<b['nearestFrontWindmillPoint']['distance']:b['nearestFrontWindmillPoint']={'distance':distance,'time':time,'stage':stage,'point':point}
with gzip.open(ROOT/'trace.jsonl.gz','rb') as f:
 for line in f:
  expandedHash.update(line);expandedBytes+=len(line);lines+=1;e=json.loads(line);assert e['seq']==lines;types[e['type']]+=1
  if e['type']=='motion':
   nearest(e['before'],e['timeStart'],'motion-before');nearest(e['after'],e['timeEnd'],'motion-after')
  if e['type']=='gap-cross':balls[e['ballId']]['crosses'].append(e)
  elif e['type']=='contact':
   part=e['part'];contactCounts[key(part)]+=1
   for before,after in [(e['before'],e['after']),(e['peerBefore'],e['peerAfter'])]:
    if before is None:continue
    nearest(before,e['time'],'contact-before');nearest(after,e['time'],'contact-after');b=balls[before['id']];velocity=before['vx']!=after['vx'] or before['vy']!=after['vy'];position=before['x']!=after['x'] or before['y']!=after['y'];c={'seq':e['seq'],'time':e['time'],'stage':e['stage'],'part':part,'solverResult':e['solverResult']}
    if e['peerBefore']:c['otherBallId']=e['peerBefore']['id'] if before['id']==e['before']['id'] else e['before']['id']
    b['last']=c
    if velocity:b['lastVelocity']=c
    timed={**c,'timeStart':e['timeStart'],'timeEnd':e['timeEnd'],'velocityChanged':velocity,'positionChanged':position}
    gate=obs[before['id']]['route']['firstDescending']
    if gate:
     timed['sameSubstepAsInterpolatedGate']=e['timeStart']<=gate['time']<=e['timeEnd']
     if e['time']<=gate['time']:b['gateBefore']=timed
     elif b['gateAfter'] is None:b['gateAfter']=timed
    if part['kind']=='pin':
     b['pinChanged'].add(part['id'])
     if e['solverResult']:b['pinImpulse'].add(part['id'])
    if part['kind']=='wall' and part.get('role')=='heso-guide':
     b['trayChanged']+=1;b['trayVelocityChanged']+=int(velocity);b['trayPositionOnly']+=int(not velocity and position);b['trayIndices'].add(indices.get(fixedkey(part),'unmatched'))
    if part['kind']=='windmill-arm':
     b['windmillChanged']+=1
     if e['solverResult']:b['windmillImpulse']+=1;b['firstWindmillTime']=e['time'] if b['firstWindmillTime'] is None else b['firstWindmillTime']
  elif e['type']=='outcome':balls[e['ball']['id']]['outcome']={'time':e['time'],'kind':e['outcome'],'state':e['ball'],'seq':e['seq']}
assert lines==manifest['records']==summary['records'];assert expandedBytes==manifest['expandedBytes'] and expandedHash.hexdigest()==manifest['expandedSHA']
for k,v in summary['counts'].items():assert types[k]==v
rows=[];representatives={}
for b in sorted(balls.values(),key=lambda b:b['ballId']):
 old=expected[b['ballId']];assert b['crosses']==old['gapCrossings'];assert b['last']==old['lastChangedContact'];assert b['lastVelocity']==old['lastVelocityChangingContact'];assert b['outcome']==old['outcome'];o=obs[b['ballId']];assert b['outcome']['kind']==o['outcome']
 front=[e for e in b['crosses'] if e['frontBefore'] and e['frontAfter']];down=[e for e in front if e['sourceKind']=='kinematic-motion' and e['direction']=='descending'];first=down[0] if down else None;clear=[e for e in down if e['discClearAtCentreCross']];fc=clear[0] if clear else None
 b['firstFrontDescending']=first;b['firstClearFrontDescending']=fc;b['classification']=first['classification'] if first else 'other';b['firstClearanceClass']='clear' if first and first['discClearAtCentreCross'] else 'negative' if first else 'none';b['reverseAcrossFirstGap']=[e for e in front if first and e['seq']>first['seq'] and e['gapId']==first['gapId'] and e['direction']=='ascending' and e['sourceKind']=='kinematic-motion'];b['reverseAcrossFirstClearGap']=[e for e in front if fc and e['seq']>fc['seq'] and e['gapId']==fc['gapId'] and e['direction']=='ascending' and e['sourceKind']=='kinematic-motion'];b['correctionCrossCount']=sum(e['sourceKind']=='solver-position-correction' for e in b['crosses']);b['backOrMixedCrossCount']=len(b['crosses'])-len(front);b['roadChanged']=sorted(b['pinChanged']&set(range(1,27)));b['roadImpulse']=sorted(b['pinImpulse']&set(range(1,27)));b['gate']=o['route']['firstDescending'];b['terminal']=o['route']['terminalFirstEntry'];b['secondsLastContactToOutcome']=b['outcome']['time']-b['last']['time'] if b['last'] else None
 label=f"{b['classification']}-{b['firstClearanceClass']}-{b['outcome']['kind']}";representatives.setdefault(label,b['ballId']);rows.append(b)
byFirst={}
for b in rows:
 k=b['classification']+'-'+b['firstClearanceClass'];byFirst.setdefault(k,[]).append(b)
byGap={}
for gap in summary['gaps']:
 relevant=[b for b in rows if any(e['gapId']==gap['id'] and e['frontBefore'] and e['frontAfter'] and e['sourceKind']=='kinematic-motion' and e['direction']=='descending' for e in b['crosses'])]
 first=[b for b in rows if b['firstFrontDescending'] and b['firstFrontDescending']['gapId']==gap['id']]
 byGap[gap['id']]={'classification':gap['classification'],'firstDescending':group(first),'anyFrontKinematicDescending':group(relevant),'kinematicCrossEvents':sum(e['gapId']==gap['id'] and e['sourceKind']=='kinematic-motion' for b in rows for e in b['crosses']),'correctionCrossEvents':sum(e['gapId']==gap['id'] and e['sourceKind']=='solver-position-correction' for b in rows for e in b['crosses'])}
otherOut=[b for b in rows if b['classification']=='other' and b['outcome']['kind']=='out'];noCrossBreakdown={}
for zone in ['left','envelope','right','unobserved']:
 z=[b for b in otherOut if (b['gate'] or {}).get('zone','unobserved')==zone];noCrossBreakdown[zone]={'total':group(z),'roadChanged':group([b for b in z if b['roadChanged']]),'roadImpulse':group([b for b in z if b['roadImpulse']]),'noRoadChanged':group([b for b in z if not b['roadChanged']]),'windmillImpulse':group([b for b in z if b['windmillImpulse']]),'entryPin1or2Changed':group([b for b in z if b['pinChanged']&{1,2}]),'pin26Changed':group([b for b in z if 26 in b['pinChanged']]),'gateBeforeContactGroups':dict(collections.Counter(key(b['gateBefore']['part']) if b['gateBefore'] else 'none' for b in z)),'gateAfterContactGroups':dict(collections.Counter(key(b['gateAfter']['part']) if b['gateAfter'] else 'none' for b in z))}
lastOut={}
for b in rows:
 if b['outcome']['kind']=='out':lastOut.setdefault(key(b['last']['part']) if b['last'] else 'none',[]).append(b)

mainClasses={}
for b in rows:
 k=b['firstClearFrontDescending']['classification'] if b['firstClearFrontDescending'] else 'no-clear';mainClasses.setdefault(k,[]).append(b)
noClearOut=[b for b in rows if not b['firstClearFrontDescending'] and b['outcome']['kind']=='out'];noClearBreakdown={}
for zone in ['left','envelope','right','unobserved']:
 z=[b for b in noClearOut if (b['gate']or{}).get('zone','unobserved')==zone];noClearBreakdown[zone]={'total':group(z),'roadChanged':group([b for b in z if b['roadChanged']]),'noRoadChanged':group([b for b in z if not b['roadChanged']]),'windmillImpulse':group([b for b in z if b['windmillImpulse']]),'entryPin1or2Changed':group([b for b in z if b['pinChanged']&{1,2}]),'pin26Changed':group([b for b in z if 26 in b['pinChanged']])}
left=[b for b in rows if b['outcome']['kind']=='out' and (b['gate']or{}).get('zone')=='left'];reach=10+1.3+raw['display']['ballRadius'];outside=[b for b in left if abs((b['gate']['sourceX']-28)/2-64)>reach]
leftWheel={'total':group(left),'atGateOutsideBallSweptEnvelope':group(outside),'outsideButAnyWindmillImpulse':group([b for b in outside if b['windmillImpulse']]),'windmillImpulseBeforeFirstGate':group([b for b in left if b['firstWindmillTime'] is not None and b['firstWindmillTime']<b['gate']['time']]),'firstWindmillImpulseAfterFirstGate':group([b for b in left if b['firstWindmillTime'] is not None and b['firstWindmillTime']>=b['gate']['time']]),'noWindmillImpulse':group([b for b in left if not b['windmillImpulse']]),'noRoadChanged':group([b for b in left if not b['roadChanged']]),'ball1Nearest':balls[1]['nearestFrontWindmillPoint'],'ballCentreContactEnvelopeRadius':reach}
mainRepresentatives={}
for b in rows:
 label=(b['firstClearFrontDescending']['classification'] if b['firstClearFrontDescending'] else 'no-clear')+'-'+b['outcome']['kind'];mainRepresentatives.setdefault(label,b['ballId'])

report={'scope':'Read-only single exact250 baseline. First classification is mutually exclusive first front/front kinematic descending centre crossing, with nonnegative/negative radius-clearance split. Geometric crossing and final OUT association do not establish causality. No new measurement or source changes.','sourceSHA':raw['sourceSHA'],'commit':prov['commit'],'oracleExact':True,'traceSHA':manifest,'integrity':{'records':lines,'expandedBytes':expandedBytes,'types':dict(types),'summaryAll250Exact':True},'outcomes':counter(rows),'validDiscClearClasses':{k:group(v)for k,v in mainClasses.items()},'noClearOutByFirst713Zone':noClearBreakdown,'leftFirst713WindmillRelation':leftWheel,'representativesMainMinimumID':mainRepresentatives,'firstClasses':{k:group(v) for k,v in byFirst.items()},'firstGap':byGap,'reverseAcrossFirstGap':group([b for b in rows if b['reverseAcrossFirstGap']]),'reverseAcrossFirstClearGap':group([b for b in rows if b['reverseAcrossFirstClearGap']]),'crossWithoutRoadChanged':group([b for b in rows if b['firstFrontDescending'] and not b['roadChanged']]),'crossWithoutRoadImpulse':group([b for b in rows if b['firstFrontDescending'] and not b['roadImpulse']]),'correctionCross':{'balls':group([b for b in rows if b['correctionCrossCount']]),'events':sum(b['correctionCrossCount'] for b in rows)},'backOrMixedCrossEvents':sum(b['backOrMixedCrossCount'] for b in rows),'trayAnyChanged':group([b for b in rows if b['trayChanged']]),'trayVelocityChanged':group([b for b in rows if b['trayVelocityChanged']]),'trayOnlyPositionCorrection':group([b for b in rows if b['trayChanged'] and not b['trayVelocityChanged']]),'terminal':group([b for b in rows if b['terminal']]),'noDescendingCrossOutByFirst713Zone':noCrossBreakdown,'lastContactOut':{k:{**group(v),'seconds':{'min':min(b['secondsLastContactToOutcome'] for b in v),'median':statistics.median(b['secondsLastContactToOutcome'] for b in v),'max':max(b['secondsLastContactToOutcome'] for b in v)}} for k,v in lastOut.items()},'representativesMinimumID':representatives}
(HERE/'summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
def plain(v):
 if isinstance(v,set):return sorted(v)
 raise TypeError(type(v))
(HERE/'all250.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2,default=plain)+'\n')
(HERE/'representatives.json').write_text(json.dumps({'selection':'Minimum actual ID per mutually exclusive first-cross clearance/outcome group; no favourable-result selection. Other means no qualifying first downward motion crossing, not necessarily no road contact or no correction/ascending crossing.','ids':representatives,'mainDiscClearIDs':mainRepresentatives},ensure_ascii=False,indent=2)+'\n')
fields=['ballId','outcome','firstClass','firstClearanceClass','firstGap','firstSeq','firstTimeStart','firstTimeEnd','reverseSameGap','reverseFirstClearGap','roadChanged','roadImpulse','pin1or2Changed','pin26Changed','windmillImpulse','trayChanged','trayVelocityChanged','trayPositionOnly','trayIndices','first713Zone','first713X','first713Time','terminalTime','correctionCrosses','backOrMixedCrosses','lastContactSeq','lastContactKind','lastContactPart','lastContactOtherBallId','secondsLastContactToOutcome','outcomeTime','outcomeSourceX','outcomeSourceY']
with (HERE/'all250.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
 for b in rows:
  first=b['firstFrontDescending'] or {};last=b['last'] or {};part=last.get('part',{});gate=b['gate'] or {};state=b['outcome']['state'];w.writerow(dict(zip(fields,[b['ballId'],b['outcome']['kind'],b['classification'],b['firstClearanceClass'],first.get('gapId'),first.get('seq'),first.get('timeStart'),first.get('timeEnd'),len(b['reverseAcrossFirstGap']),len(b['reverseAcrossFirstClearGap']),'|'.join(map(str,b['roadChanged'])),'|'.join(map(str,b['roadImpulse'])),bool(b['pinChanged']&{1,2}),26 in b['pinChanged'],b['windmillImpulse'],b['trayChanged'],b['trayVelocityChanged'],b['trayPositionOnly'],'|'.join(map(str,sorted(b['trayIndices']))),gate.get('zone'),gate.get('sourceX'),gate.get('time'),b['terminal']['time'] if b['terminal'] else None,b['correctionCrossCount'],b['backOrMixedCrossCount'],last.get('seq'),part.get('kind'),part.get('role',part.get('id')),last.get('otherBallId'),b['secondsLastContactToOutcome'],b['outcome']['time'],state['x']*2+28,(state['y']-120)*2])))
print(json.dumps({k:report[k] for k in ['outcomes','firstClasses','reverseAcrossFirstGap','reverseAcrossFirstClearGap','crossWithoutRoadChanged','crossWithoutRoadImpulse','correctionCross','trayAnyChanged','trayVelocityChanged','trayOnlyPositionCorrection','terminal','noDescendingCrossOutByFirst713Zone','lastContactOut','representativesMinimumID']},ensure_ascii=False))
import runpy
runpy.run_path(str(HERE/'finalize.py'))
