import bpy,json,os
from mathutils import Vector
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# A new background process with factory startup; no user's open scene is modified.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
font=bpy.data.fonts.load(root+'/Assets/Yozora/Fonts/NotoSansCJKjp-Regular.otf')
result=[]
for name,body,extrude,bevel in [('Divine','神\n器',.028,.008),('SAO','SAO',.025,.008)]:
 curve=bpy.data.curves.new(name,'FONT');curve.body=body;curve.font=font;curve.align_x='CENTER';curve.align_y='CENTER';curve.size=1;curve.space_line=.62 if name=='Divine' else .91;curve.extrude=extrude;curve.bevel_depth=bevel;curve.bevel_resolution=4;curve.resolution_u=16;curve.offset=.004 if name=='Divine' else .001
 obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj)
 bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.context.view_layer.update()
 evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
 minx=min(v.co.x for v in mesh.vertices);maxx=max(v.co.x for v in mesh.vertices);miny=min(v.co.y for v in mesh.vertices);maxy=max(v.co.y for v in mesh.vertices);height=maxy-miny
 vs=[];ns=[];ts=[]
 # Split by face corners so cap and rounded bevel normals remain explicit.
 for tri in mesh.loop_triangles:
  n=len(vs)
  for vi in tri.vertices:
   v=mesh.vertices[vi];vs.append({'x':(v.co.x-(minx+maxx)/2)/height,'y':(v.co.y-(miny+maxy)/2)/height,'z':-v.co.z/height});normal=v.normal if mesh.polygons[tri.polygon_index].use_smooth else tri.normal;ns.append({'x':normal.x,'y':normal.y,'z':-normal.z})
  ts.extend([n,n+2,n+1])
 result.append({'name':name,'vertices':vs,'normals':ns,'triangles':ts})
 evaluated.to_mesh_clear();obj.select_set(False)
 obj.location.x=0 if name=='Divine' else 2.5
bpy.ops.wm.save_as_mainfile(filepath=root+'/ModelSources/EmbossedCabinetType.blend')
with open(root+'/Assets/Yozora/Art/Models/cabinet-type.json','w') as f:json.dump({'meshes':result},f,separators=(',',':'))
print('EMBOSSED_MODEL_SUCCESS',[(x['name'],len(x['vertices'])) for x in result])
