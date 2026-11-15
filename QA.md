# Prüfung der ersten vollständigen Fassung

Stand: 15. November 2026. Die erste vollständige Fassung wurde mit den folgenden Spiel- und Browserprüfungen validiert.

- **Spielkern:** 27 bestandene Node-Tests. Geprüft werden unter anderem zusammenhängender Bau, Personaleinsatz, Energie, Forschungsabhängigkeiten, Recycling, Expeditionen, einmalige Fragmente, Missionsbelohnungen, Speichergrenzen, Pausen, Offline-Fortschritt sowie beschädigte und manipulierte Importe.
- **Kampagne mit regulären Ressourcen:** Ein deterministischer Durchlauf erreicht das Leuchtfeuer nach 1.417 Sekunden Spielzeit, mit 15 Modulen und sechs Crew-Mitgliedern. Keine während des Durchlaufs künstlich hinzugefügten Ressourcen. Das misst die wirtschaftliche Erreichbarkeit, nicht die Zeit, die Menschen für Entscheidungen und Bergungsflüge benötigen.
- **Desktop-Browser:** Einstieg von der ersten Konstruktion bis zur abgeschlossenen Expedition und dem ersten Fragment tatsächlich durchgespielt. Bergungsflug gesteuert, beendet und Fracht verbucht. Alle acht Spielfenster geöffnet. Autosave, Neuladen, Dateiexport, bestätigter Import und Ablehnung einer beschädigten Datei geprüft.
- **Mobiler Browser:** 390 × 844 Pixel, echte Touch-Ereignisse für Baumenü, Solarsegel und Kapitelabschluss. Forschung geöffnet, keine horizontale Überbreite. Die untere Navigation bleibt sichtbar.
- **Einzeldatei:** Über HTTP mit Bauen, Kapitelabschluss, Sound, Bergungsflug und Frachtaufnahme geprüft. Keine zusätzlichen Netzwerkanfragen und keine JavaScript-Fehler. Der Aufruf von `file://` wird durch die Browser-Verwaltung dieser Cloud-Umgebung blockiert; dieser Aufrufweg konnte hier deshalb nicht geprüft werden.
- **Statischer Build:** Unter `/dist/` auf einem Unterpfad geöffnet, alle sechs Ressourcenanzeigen vorhanden, keine JavaScript-Fehler. Dies prüft die relative Pfadstruktur für GitHub Pages.

Die Browser-Prüfung lief in Chromium mit Playwright. Safari und Firefox wurden nicht ausgeführt. Alle Screenshots befinden sich lokal in `test-results/`; die veröffentlichbare Vorschau liegt in `assets/preview.png`.
