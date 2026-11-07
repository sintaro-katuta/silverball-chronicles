import AppKit
import ImageIO
let source=CGImageSourceCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[1]) as CFURL,nil)!
let image=CGImageSourceCreateImageAtIndex(source,0,nil)!
precondition(image.width % 2 == 0 && image.height % 3 == 0)
let w=image.width/2,h=image.height/3
var sw=w-10,sh=h-10
if Double(sw)/Double(sh)>1.5 {sw=sh*3/2} else {sh=sw*2/3}
for i in 0..<6 {
 let x=(i%2)*w+(w-sw)/2,y=(i/2)*h+(h-sh)/2
 let crop=image.cropping(to:CGRect(x:x,y:y,width:sw,height:sh))!
 var data=[UInt8](repeating:0,count:105*70*4)
 let c=CGContext(data:&data,width:105,height:70,bitsPerComponent:8,bytesPerRow:105*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
 c.interpolationQuality = .none;c.draw(crop,in:CGRect(x:0,y:0,width:105,height:70))
 try Data(data).write(to:URL(fileURLWithPath:"\(CommandLine.arguments[2])/step-frame-\(i).rgba"))
}
