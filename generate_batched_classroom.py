import json, math, pathlib, struct
OUT=pathlib.Path(r'D:\dsh\dsh date\GameProject-local\w05_3d_game\assets\models\classroom_m1_v01.glb')
materials=[('Floor',[.12,.13,.15,1]),('Wall',[.22,.24,.28,1]),('Ceiling',[.16,.17,.19,1]),('Wood',[.28,.16,.09,1]),('Metal',[.18,.20,.23,1]),('Board',[.025,.07,.055,1]),('Curtain',[.10,.035,.055,1]),('Door',[.20,.10,.055,1]),('Glass',[.12,.22,.28,.45]),('Trim',[.48,.34,.18,1])]
mi={n:i for i,(n,_) in enumerate(materials)}; specs=[]
def box(name,x,y,z,sx,sy,sz,mat,rot=0): specs.append((name,x,y,z,sx,sy,sz,mi[mat],rot))
# current game layout: X -10..10, Z -6..6, door +Z
box('Floor',0,-.08,0,20,.16,12,'Floor'); box('Ceiling',0,3.2,0,20,.16,12,'Ceiling')
box('Back',0,1.6,-6,20,3.2,.3,'Wall'); box('Left',-10,1.6,0,.3,3.2,12,'Wall'); box('Right',10,1.6,0,.3,3.2,12,'Wall')
box('FrontL',-9.2,1.6,6,.3,3.2,1.6,'Wall'); box('FrontR',9.2,1.6,6,.3,3.2,1.6,'Wall'); box('FrontTop',0,2.8,6,.3,.8,18.4,'Wall')
box('DoorFrameL',-.98,1.23,5.82,.16,2.46,.3,'Trim'); box('DoorFrameR',.98,1.23,5.82,.16,2.46,.3,'Trim'); box('DoorFrameTop',0,2.46,5.82,2.12,.16,.3,'Trim'); box('DoorMain',0,1.23,5.78,1.6,2.46,.14,'Door')
box('Blackboard',9.78,1.75,0,.08,1.35,4.2,'Board'); box('BoardTrim',9.72,1.75,0,.06,1.55,4.5,'Trim')
box('CurtainFar',5.82,1.55,3,2.3,2.55,.12,'Curtain'); box('CurtainNear',2.08,1.5,5.82,2.5,2.7,.12,'Curtain'); box('WindowFar',5.82,1.65,3,2.2,2.1,.05,'Glass'); box('WindowNear',2.08,1.65,5.74,2.35,2.2,.05,'Glass')
for x in [-7.4,-4.6,-1.8,1.8,4.6,6.8]:
    for z in [-4,-1.5,1.5,4]:
        box('Desk',x,.78,z,1.16,.12,.62,'Wood'); box('DeskLeg',x-.45,.39,z-.2,.08,.78,.08,'Metal'); box('DeskLeg',x+.45,.39,z-.2,.08,.78,.08,'Metal'); box('Chair',x,.46,z+.48,.42,.08,.42,'Metal'); box('ChairBack',x,.7,z+.66,.42,.4,.06,'Metal')
for x in [-6,-2,2,6]:
    for z in [-3,3]: box('Light',x,3.08,z,1.35,.05,.26,'Glass')
box('TeacherDesk',8.2,.78,0,1.7,.12,.72,'Wood'); box('Poster',-9.82,1.5,2.6,.05,.9,.7,'Curtain')
verts=[]; inds=[]; meshes=[]; nodes=[]
baseverts=[(-.5,-.5,-.5),(.5,-.5,-.5),(.5,.5,-.5),(-.5,.5,-.5),(-.5,-.5,.5),(.5,-.5,.5),(.5,.5,.5),(-.5,.5,.5)]
faces=[(0,1,2),(0,2,3),(1,5,6),(1,6,2),(5,4,7),(5,7,6),(4,0,3),(4,3,7),(3,2,6),(3,6,7),(4,5,1),(4,1,0)]
def rotate(v,a):
    c=math.cos(a); s=math.sin(a); return (c*v[0]+s*v[2],v[1],-s*v[0]+c*v[2])
for material in range(len(materials)):
    local=[]; localidx=[]
    for _,x,y,z,sx,sy,sz,mat,rot in specs:
        if mat!=material: continue
        b=len(local); local += [tuple(a+b for a,b in zip(rotate((v[0]*sx,v[1]*sy,v[2]*sz),rot),(x,y,z))) for v in baseverts]
        localidx += [b+i for f in faces for i in f]
    if not local: continue
    vo=len(verts); verts += local; inds += [i+vo for i in localidx]
    meshes.append({'name':materials[material][0]+'Batch','primitives':[{'attributes':{'POSITION':0},'indices':1,'material':material}]})
    nodes.append({'name':'Classroom_'+materials[material][0]+'_Batch','mesh':len(meshes)-1,'extras':{'staticVisual':True}})
vbytes=b''.join(struct.pack('<3f',*v) for v in verts); ibytes=b''.join(struct.pack('<I',i) for i in inds); vbytes+=b'\0'*((4-len(vbytes)%4)%4); io=len(vbytes); ibytes+=b'\0'*((4-len(ibytes)%4)%4); blob=vbytes+ibytes
meta={'asset':{'version':'2.0','generator':'Wrong Floor M1 batched classroom'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'materials':[{'name':n,'pbrMetallicRoughness':{'baseColorFactor':c,'metallicFactor':.45 if n=='Metal' else .05,'roughnessFactor':.78},'doubleSided':True} for n,c in materials],'buffers':[{'byteLength':len(blob)}],'bufferViews':[{'buffer':0,'byteOffset':0,'byteLength':len(vbytes),'target':34962},{'buffer':0,'byteOffset':io,'byteLength':len(ibytes),'target':34963}],'accessors':[{'bufferView':0,'componentType':5126,'count':len(verts),'type':'VEC3'},{'bufferView':1,'componentType':5125,'count':len(inds),'type':'SCALAR'}]}
js=json.dumps(meta,separators=(',',':')).encode(); js+=b' '*((4-len(js)%4)%4); out=struct.pack('<4sII',b'glTF',2,12+8+len(js)+8+len(blob))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob; OUT.write_bytes(out); print(f'nodes={len(nodes)} boxes={len(specs)} triangles={len(inds)//3} bytes={len(out)}')
