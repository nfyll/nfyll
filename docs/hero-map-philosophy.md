# Hero Map — Design Philosophy

**Movement name**: *Civic Cartography*

A map for a youth rec league should feel like a National Park Service trail sign, not a Google Maps screenshot. The visual posture is **calm authority** — geographic information presented as if it had been drawn by hand on parchment, then printed on the kind of paper that smells like a state park visitor center.

**Form**: Two-line topography — coastline and river. Nothing else of the actual land. The land between is left as Sky Wash, which is the same color as the page behind it; the map *floats*. Cities are not labeled; they're marked as small Sunshine Orange dots, eight of them, leaving the visual identification work to the viewer's local knowledge. The single Sand Gold star at Julington Creek is the only "you are here" mark.

**Space and composition**: The left third is empty. The H1 lives there. The map occupies the right two thirds, with coastline curving down the right edge and the St. Johns River winding north-northeast through the center. The hero is wide (1920×480, 4:1 ratio) precisely because rec lacrosse happens *across* a region — wide, not deep.

**Color discipline**: River Blue `#1B4D7E` for both line systems (river + coast) because they're the same kind of mark on the page; Deep River `#103657` for the very subtle state outline, applied at low opacity so it suggests rather than asserts; Sunshine Orange `#F2823C` for member-club markers; Sand Gold `#F4C24B` for the venue star, with a River Blue inner dot so the star feels anchored.

**Texture & craftsmanship**: Lines are not pixel-clean; they're SVG paths with deliberate small curvature variations that mimic a sharp pencil on textured paper. The dots are not perfect circles in absolute terms — they are perfect circles, but their placements have the slight asymmetry of hand-marked points. The overall composition reads as the work of a careful human cartographer, not a CAD plotter.

**Anti-pattern**: Never let this map become detailed. If you can read individual roads, it's wrong. If you can identify peninsulas precisely, it's wrong. The point is to gesture at *where NFYLL lives*, not to navigate to it.
