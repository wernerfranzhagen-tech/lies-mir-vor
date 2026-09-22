# Lies mir vor – Senioren-PWA

Eine einfache PWA zum Fotografieren gedruckter Texte, Erkennen per OCR und langsamen Vorlesen.

## Auf GitHub Pages veröffentlichen

1. Neues öffentliches GitHub-Repository anlegen, z. B. `lies-mir-vor`.
2. Den Inhalt dieses ZIP-Archivs entpacken.
3. Alle Dateien aus dem Ordner direkt in das Repository hochladen.
4. In GitHub: **Settings → Pages**.
5. Unter **Build and deployment** bei Source **Deploy from a branch** wählen.
6. Branch **main**, Ordner **/(root)** wählen und speichern.
7. Nach kurzer Zeit erscheint dort die öffentliche HTTPS-Adresse.

Die Adresse hat normalerweise die Form:
`https://DEIN-GITHUB-NAME.github.io/lies-mir-vor/`

## Hinweise

- Die OCR-Bibliothek Tesseract.js wird beim Öffnen über jsDelivr geladen. Daher braucht die Texterkennung beim ersten Einsatz Internetzugang.
- Die deutschen OCR-Sprachdaten werden bei Bedarf geladen.
- Vorlesen verwendet die Sprachausgabe des Browsers/Geräts.
- Gespeicherte Texte bleiben im Browser des jeweiligen Geräts.
- Fotos werden von dieser App nicht dauerhaft gespeichert.
