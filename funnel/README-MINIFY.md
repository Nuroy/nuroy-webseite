# Minification Notice

Die `funnel-booking.js` wurde neu geschrieben und muss noch minifiziert werden.

## Minifizieren mit:

```bash
# Mit terser (empfohlen)
npx terser funnel-booking.js -o funnel-booking.min.js -c -m

# Oder online: https://javascript-minifier.com/
```

## Wichtig:

Die CSS-Datei `funnel-qualification.css` sollte ebenfalls minifiziert werden:

```bash
# Mit cssnano
npx cssnano funnel-qualification.css funnel-qualification.min.css
```

Dann im `dashboard-jetzt.html` die Links auf die .min Versionen umstellen.
