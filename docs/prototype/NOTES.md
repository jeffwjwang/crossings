# Kiwi Streets Crossword – Ponsonby prototype
- ponsonby.html: self-contained game (built from template.html + solution_final.json via build.py)
- osm.json: Overpass extract (maps.mail.ru mirror; overpass-api.de returned 406)
- solve.py/solve2.py: geometry slot search + word fill (bank.py). build.py asserts every shared cell letter matches and no cells overlap.
- test.py: Playwright (system Chrome) solves all words on desktop + phone viewports, writes PNGs.
