import AppKit
import ImageIO
let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[1]) as CFURL,nil)!
let image=CGImageSourceCreateImageAtIndex(src,0,nil)!
guard image.width == 1536 && image.height == 1024 else {fatalError("expected 3x2 grid of 512px cells")}
let topAligned = CommandLine.arguments.count > 3 ? Int(CommandLine.arguments[3]) : 3
let bottomAligned = CommandLine.arguments.count > 4 ? Int(CommandLine.arguments[4]) : nil
for i in 0..<6 {
 let x=(i%3)*512,y=(i/3)*512+(i == topAligned ? 0 : i == bottomAligned ? 170 : 85)
 guard let crop=image.cropping(to:CGRect(x:x,y:y,width:512,height:342)) else {fatalError("crop")}
 var data=[UInt8](repeating:0,count:105*70*4)
 let c=CGContext(data:&data,width:105,height:70,bitsPerComponent:8,bytesPerRow:105*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
 c.interpolationQuality = .none;c.draw(crop,in:CGRect(x:0,y:0,width:105,height:70))
 try Data(data).write(to:URL(fileURLWithPath:"\(CommandLine.arguments[2])/step-frame-\(i).rgba"))
}
