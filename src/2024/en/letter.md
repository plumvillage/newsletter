---
layout: layouts/print2024
size_label: Letter
# since reflowing/tweaking everything to Letter format is a lot of work, we only scale the A4 content to fit into Letter format
# this is achieved by first adding width to A4, such that it has the same page ratio as Letter:
size: "229.5mm 297mm"
# later, in the PDF generation, we uniformly downscale (~94%) to Letter (11"x8.5")
bleed: 0mm
marks: none
---
