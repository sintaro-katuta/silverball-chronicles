import AppKit
import ImageIO
import UniformTypeIdentifiers
let source=CGImageSourceCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[1]) as CFURL,nil)!
let image=CGImageSourceCreateImageAtIndex(source,0,nil)!
let w=Int(CommandLine.arguments[3])!,h=Int(CommandLine.arguments[4])!
var data=[UInt8](repeating:0,count:w*h*4)
let c=CGContext(data:&data,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
c.interpolationQuality = .none;c.draw(image,in:CGRect(x:0,y:0,width:w,height:h))
let dst=CGImageDestinationCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[2]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(dst,c.makeImage()!,nil);precondition(CGImageDestinationFinalize(dst))
