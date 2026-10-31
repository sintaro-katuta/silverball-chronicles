// User clarification: this moulding is decoration behind the nail plane.
// Keep its exact artwork/trace and let front balls cross in front of it.
export function installRearElectricDecoration(physics){
 const path=physics.sourceGuidePaths.find(p=>p.id==='electric-left-moulding');
 if(!path)throw Error('Missing electric decoration trace');
 path.contactRole='rear-decoration';path.depthPlane='behind-pins';
 for(const c of physics.colliders)if(c.sourceGuideId===path.id){c.active=false;c.contactRole='rear-decoration';c.depthPlane='behind-pins';}
 physics.electricDecorationProfile='behind-pins-v1';
}
