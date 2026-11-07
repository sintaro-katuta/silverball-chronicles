import AppKit
import ImageIO
let src=CGImageSourceCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[1]) as CFURL,nil)!
let image=CGImageSourceCreateImageAtIndex(src,0,nil)!
let w=Int(CommandLine.arguments[3]) ?? 105,h=Int(CommandLine.arguments[4]) ?? 70
var d=[UInt8](repeating:0,count:w*h*4)
let ctx=CGContext(data:&d,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.interpolationQuality = .none
ctx.draw(image,in:CGRect(x:0,y:0,width:w,height:h))
try Data(d).write(to:URL(fileURLWithPath:CommandLine.arguments[2]))
