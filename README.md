# StudySwap - React Native App


## Schnellstart mit Expo Go


## Voraussetzungen 

### 1. Node.js und npm
- **Download**: [https://nodejs.org/](https://nodejs.org/)
- **Version**: Node.js 18.x oder höher (LTS-Version)
- **Installation**: 
  1. Laden Sie die Windows-Installer (.msi) herunter
  2. Führen Sie die Installation aus (alle Standardeinstellungen beibehalten)
  3. Starten Sie Ihren Computer neu
- **Verifikation**: Öffnen Sie die Eingabeaufforderung (cmd) und führen Sie aus:
  ```cmd
  node --version
  npm --version
  ```

### 2. Android-Handy Vorbereitung
- **Expo Go App installieren**: 
  1. Öffnen Sie den Google Play Store auf Ihrem Android-Handy
  2. Suchen Sie nach "Expo Go"
  3. Installieren Sie die offizielle Expo Go App
- **WiFi-Verbindung**: Stellen Sie sicher, dass Ihr Handy und Computer im gleichen WiFi-Netzwerk sind

## Installation und Setup

### 1. Projekt herunterladen
- https://github.com/antallpt/StudySwapFrontEnd/tree/master
- Laden Sie das Projekt als ZIP-Datei herunter
- Entpacken Sie die ZIP-Datei in einen Ordner (z.B. `C:\StudySwap\`)

### 2. Projektordner öffnen
- Öffnen Sie die Eingabeaufforderung (cmd)
- Navigieren Sie zum Projektordner:
  ```cmd
  cd C:\StudySwap
  ```

### 3. Abhängigkeiten installieren
```cmd
npm install
```
**Hinweis**: Dieser Schritt kann 2-5 Minuten dauern.

## App mit Expo Go starten 

### Schritt 1: Development Server starten
```cmd
npx expo start
```

### Schritt 2: QR-Code scannen
1. **QR-Code wird angezeigt**: Nach dem Start sehen Sie einen QR-Code in der Eingabeaufforderung
   - Falls in der Konsole unter dem QR-Code Using development build steht, drücken Sie die Taste "s" damit das Build auf Expo Go wechselt
2. **Expo Go öffnen**: Öffnen Sie die Expo Go App auf Ihrem Android-Handy
3. **QR-Code scannen**: 
   - Tippen Sie auf "Scan QR Code" in der Expo Go App
   - Scannen Sie den QR-Code von Ihrem Computer-Bildschirm
4. **App lädt**: Die StudySwap App wird automatisch auf Ihrem Handy geladen

### Schritt 3: App verwenden
- Die App ist jetzt auf Ihrem Handy verfügbar
- Sie können alle Features testen (Login, Produkte erstellen, Chat, etc.)
- Bei Änderungen am Code wird die App automatisch aktualisiert

## Alternative: Tunnel-Modus (falls WiFi-Probleme auftreten)

Falls der QR-Code nicht funktioniert oder Verbindungsprobleme auftreten:

```cmd
npx expo start --tunnel
```

Dies erstellt einen Tunnel über das Internet und sollte auch bei Netzwerkproblemen funktionieren.

## Häufige Probleme und Lösungen (Windows-spezifisch)

### Problem: "npm command not found"
**Lösung**: 
1. Stellen Sie sicher, dass Node.js korrekt installiert ist
2. Starten Sie die Eingabeaufforderung neu
3. Falls das Problem weiterhin besteht, installieren Sie Node.js erneut

### Problem: "expo command not found"
**Lösung**: 
```cmd
npm install -g @expo/cli
```

### Problem: QR-Code wird nicht angezeigt
**Lösung**: 
1. Stellen Sie sicher, dass Ihr Computer und Handy im gleichen WiFi-Netzwerk sind
2. Versuchen Sie den Tunnel-Modus:
   ```cmd
   npx expo start --tunnel
   ```

### Problem: "Metro bundler failed to start"
**Lösung**: 
```cmd
# Cache leeren
npx expo start --clear
```

### Problem: App lädt nicht auf dem Handy
**Lösung**: 
1. Überprüfen Sie Ihre Internetverbindung
2. Stellen Sie sicher, dass die Expo Go App die neueste Version ist
3. Versuchen Sie den Tunnel-Modus:
   ```cmd
   npx expo start --tunnel
   ```

### Problem: "Build failed" oder "npm install" Fehler
**Lösung**: 
1. Stellen Sie sicher, dass Sie eine stabile Internetverbindung haben
2. Löschen Sie den node_modules Ordner und versuchen Sie es erneut:
   ```cmd
   rmdir /s node_modules
   npm install
   ```

### Problem: Antivirus-Software blockiert die Installation
**Lösung**: 
1. Fügen Sie den Projektordner zu den Ausnahmen Ihres Antivirus-Programms hinzu
2. Deaktivieren Sie temporär die Echtzeitschutz-Funktion während der Installation

## Projektstruktur

```
StudySwap/
├── app/                    # App-Navigation und Screens
│   ├── (public)/           # Öffentliche Screens (Login, Registrierung)
│   ├── (tabs)/             # Haupt-Tabs (Home, Add, Messages, Profile)
│   └── chat/               # Chat-Screens
├── components/             # Wiederverwendbare Komponenten
├── contexts/              # React Context (Authentication)
├── services/              # API-Services und Utilities
├── constants/             # Theme und Konstanten
└── assets/                # Bilder und andere Assets
```

## Wichtige Features

- **Benutzerauthentifizierung**: Login und Registrierung
- **Produktverwaltung**: Produkte erstellen, anzeigen und löschen
- **Chat-System**: Nachrichten zwischen Käufern und Verkäufern
- **Profilverwaltung**: Benutzerprofile und eigene Produkte verwalten
- **Bild-Upload**: Mehrere Bilder pro Produkt mit Drag & Drop

## Technische Details

- **Framework**: React Native mit Expo
- **Navigation**: Expo Router
- **State Management**: React Context
- **Styling**: StyleSheet mit Theme-System
- **API**: REST API mit JWT-Authentifizierung
- **Backend**: Läuft auf externem Server (bereits konfiguriert)

## Support

Bei Problemen oder Fragen können Sie sich an das Entwicklungsteam wenden.

## Entwicklungsnotizen

- Die App ist für Android-Geräte optimiert
- Backend-Server ist bereits konfiguriert und läuft (keine zusätzliche Konfiguration nötig)
- Alle API-Endpunkte sind bereits eingerichtet
- Die App unterstützt sowohl Light- als auch Dark-Mode
- **Wichtig**: Die App funktioniert nur mit einer aktiven Internetverbindung

## Schnellreferenz für Windows-Benutzer

1. **Node.js installieren** → [https://nodejs.org/](https://nodejs.org/)
2. **Expo CLI installieren** → `npm install -g @expo/cli`
3. **Expo Go App installieren** → Google Play Store
4. **Projekt herunterladen** → ZIP-Datei entpacken
5. **Abhängigkeiten installieren** → `npm install`
6. **App starten** → `npx expo start`
7. **QR-Code scannen** → Mit Expo Go App

**Gesamte Installationszeit**: 10-15 Minuten

---

**Viel Erfolg beim Testen der StudySwap App!**

Bei Fragen oder Problemen können Sie sich gerne an das Entwicklungsteam wenden.