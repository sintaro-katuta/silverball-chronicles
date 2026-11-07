import Foundation
import Vision
import CoreImage
import AppKit
import ImageIO
import UniformTypeIdentifiers
let file=URL(fileURLWithPath:CommandLine.arguments[1]); let output=URL(fileURLWithPath:CommandLine.arguments[2])
let src=CGImageSourceCreateWithURL(file as CFURL,nil)!,cg=CGImageSourceCreateImageAtIndex(src,0,nil)!
let handler=VNImageRequestHandler(cgImage:cg)
let req=VNGenerateForegroundInstanceMaskRequest()
req.usesCPUOnly=true
try handler.perform([req])
guard let result=req.results?.first else {fatalError("No foreground instance")}
print("instances",result.allInstances)
let mask=try result.generateScaledMaskForImage(forInstances:result.allInstances,from:handler)
let m=CIImage(cvPixelBuffer:mask), image=CIImage(cgImage:cg), clear=CIImage(color:.clear).cropped(to:image.extent)
let filter=CIFilter(name:"CIBlendWithMask")!
filter.setValue(image,forKey:kCIInputImageKey);filter.setValue(clear,forKey:kCIInputBackgroundImageKey);filter.setValue(m,forKey:kCIInputMaskImageKey)
let out=CIContext().createCGImage(filter.outputImage!,from:image.extent)!
let dst=CGImageDestinationCreateWithURL(output as CFURL,UTType.png.identifier as CFString,1,nil)!
CGImageDestinationAddImage(dst,out,nil);precondition(CGImageDestinationFinalize(dst));print("saved",out.width,out.height)
