input="./builds/generated 2022-02-23 16-01-30.pdf"
dpi=400
Q=1.5

gs \
    -o "$input downsampled_dpi${dpi}_q$Q.pdf" \
    -sDEVICE=pdfwrite \
    -dNOPAUSE \
    
    -dDownsampleColorImages=true \
    -dDownsampleGrayImages=true \
    -dDownsampleMonoImages=true \
    -dColorImageResolution=$dpi \
    -dGrayImageResolution=$dpi \
    -dMonoImageResolution=$dpi \
    -dColorImageDownsampleThreshold=1.0 \
    -dGrayImageDownsampleThreshold=1.0 \
    -dMonoImageDownsampleThreshold=1.0 \
    -c "<< /GrayImageDict << /Blend 1 /VSamples [ 1 1 1 1 ] /QFactor $Q /HSamples [ 1 1 1 1 ] >> /ColorACSImageDict << /VSamples [ 1 1 1 1 ] /HSamples [ 1 1 1 1 ] /QFactor $Q /Blend 1 >> /ColorImageDownsampleType /Bicubic /ColorConversionStrategy /LeaveColorUnchanged >> setdistillerparams" \
    -f "$input"


<<comment
for print:
-sColorConversionStrategy=CMYK \



for DPI 300
Q
0.01 -> 175 MiB
0.04 -> 110 MiB
0.1  ->  78 MiB
0.2  ->  56 MiB
0.8  ->  29 MiB
3.0  ->  17 MiB very poor
5.0  ->  14 MiB Too Harsh!

for DPI 400
Q
1.5  ->  26 MiB poor, but ok for web view
3.0  ->  20 MiB


https://stackoverflow.com/questions/40849325/ghostscript-pdfwrite-specify-jpeg-quality

-c "<< /GrayImageDict << /Blend 1 /VSamples [2 1 1 2] /QFactor 2.4 /HSamples [2 1 1 2] >> /ColorImageDict << /Blend 1 /VSamples [2 1 1 2] /QFactor 2.4 /HSamples [2 1 1 2] >> >> setdistillerparams " \


gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -sOutputFile=out.pdf full.pdf

	75dpi	150		300		    300, colour preserving
	/screen	/ebook	/printer	/prepress	        /default

gswin64c.exe -sOutputFile=out.pdf -dNOPAUSE -dBATCH ^-sDEVICE=pdfwrite -dPDFSETTINGS=/prepress -c "<< /ColorACSImageDict << /VSamples [ 1 1 1 1 ] /HSamples [ 1 1 1 1 ] /QFactor 0.08 /Blend 1 >> /ColorImageDownsampleType /Bicubic /ColorConversionStrategy /LeaveColorUnchanged >> setdistillerparams" -f in1.pdf

comment
