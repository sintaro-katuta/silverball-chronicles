import AppKit
import ImageIO
import UniformTypeIdentifiers
let width=1536,height=1024
func load(_ path:String)->[UInt8] {let s=CGImageSourceCreateWithURL(URL(fileURLWithPath:path) as CFURL,nil)!,im=CGImageSourceCreateImageAtIndex(s,0,nil)!;precondition(im.width==width && im.height==height);var d=[UInt8](repeating:0,count:width*height*4);let c=CGContext(data:&d,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(im,in:CGRect(x:0,y:0,width:width,height:height));return d}
let original=load(CommandLine.arguments[1]),candidate=load(CommandLine.arguments[2]);let hero=Set(CommandLine.arguments[4].split(separator:",").compactMap{Int($0)})
let step = CommandLine.arguments.count > 5 ? Int(CommandLine.arguments[5])! : 4
precondition(step > 0 && 512 % step == 0)
var output=original
for cell in hero {let cx=cell%3*512,cy=cell/3*512;for gy in 0..<(512/step) {for gx in 0..<(512/step) {let x=cx+gx*step,y=cy+gy*step,src=((y+step/2)*width+x+step/2)*4,a=Int(candidate[src+3]);var pixel=[UInt8](repeating:0,count:4);if a>=192 {for k in 0..<3 {pixel[k]=UInt8(min(255,(Int(candidate[src+k])*255+a/2)/a))};pixel[3]=255};for yy in 0..<step {for xx in 0..<step {let dst=((y+yy)*width+x+xx)*4;for k in 0..<4 {output[dst+k]=pixel[k]}}}}}}
let ctx=CGContext(data:&output,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
let dst=CGImageDestinationCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[3]) as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(dst,ctx.makeImage()!,nil);precondition(CGImageDestinationFinalize(dst));print("candidate grid, unchanged original cells \(Set(0..<6).subtracting(hero).sorted())")
