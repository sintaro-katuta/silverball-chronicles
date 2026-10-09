// Logical board coordinates stay fixed. Only the display sampling changes.
export function presentationResolution(width,height,cssWidth,dpr=1){
 const requested=Math.max(1,(cssWidth||width)/width*Math.max(1,dpr||1));
 return Math.min(3,requested,Math.sqrt(1_600_000/(width*height)));
}
export const LCD_ART_RESOLUTION=3;
export function presentationSurface(width,height,paint,resolution=LCD_ART_RESOLUTION){
 const canvas=document.createElement('canvas');canvas.width=width*resolution;canvas.height=height*resolution;
 const ctx=canvas.getContext('2d');ctx.scale(resolution,resolution);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';paint(ctx);
 return canvas;
}
export function smoothTexture(texture){texture.source.scaleMode='linear';return texture;}
