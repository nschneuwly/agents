---
name: add-url-params
description: "Fuegt robuste URL-Parameter (Deep Links) zu einer ArcGIS React Webapp hinzu. Verwende diesen Skill wenn: Direkteinstieg auf Thema/Jahr/Kartenausschnitt, Share Links, URL-State Synchronisierung, Query-Parameter, Deep Linking, Permalinks."
argument-hint: "Welche Parameter werden benoetigt (z. B. topic, year, bbox)?"
---

# Add URL Params - Deep Linking for WebMap Apps

Fuegt einen stabilen URL-State fuer ArcGIS WebMap-basierte React Apps hinzu.

## Wann verwenden

- Direkteinstieg auf ein Thema (z. B. water, land, fertilizer)
- Einstieg auf ein bestimmtes Jahr
- Einstieg auf einen geografischen Ausschnitt
- Sharebare Links fuer interne und externe Nutzer
- Wiederherstellen eines relevanten App-Kontexts nach Reload

## Kontext7 verwenden

Bei ArcGIS Maps SDK, Map Components und Calcite APIs immer Context7 verwenden, bevor konkrete API-Syntax implementiert wird.

## Ziele

1. URL ist eine verlaessliche Quelle fuer deeplink-relevanten Zustand
2. Ungueltige oder unvollstaendige Werte brechen die App nicht
3. Keine Event-Schleifen zwischen Store, Karte und URL
4. Kartenparameter werden nur im ruhigen Kartenzustand geschrieben

## Empfohlenes Parameter-Modell

Verwende ein kategoriebasiertes Modell statt fixer Feldnamen, damit der Skill in unterschiedlichen Apps wiederverwendbar bleibt.

Pflichtkategorie:

- schema/version: Version des URL-Schemas (z. B. v=1)

Optionale Kategorien (je nach App):

- fachlicher Kontext: z. B. theme, topic, scenario, year
- geografischer Kontext: z. B. bbox + wkid, center + zoom, regionId, countryCode
- Daten-/Filterkontext: z. B. layerId, indicatorId, selectedFilters
- UI-Kontext: z. B. activePanel, selectedTab, detailId
- technische Flags: z. B. debug, source, migrationHint

Regeln fuer Parameternamen:

- Stabile, sprechende Namen verwenden
- Keine app-internen Implementierungsdetails leaken
- Werte kurz halten, aber eindeutig
- Fuer IDs bevorzugt kanonische Keys statt Labels verwenden

Optionale technische Parameter:

- v: URL-Schema-Version fuer spaetere Migrationen

## TypeScript + Zod: immer gemeinsam

Definiere URL-Parameter immer als Zod-Schema und leite TypeScript-Typen daraus ab.

```ts
import * as z from 'zod'

const TopicSchema = z.enum(['water', 'land', 'fertilizer', 'biodiversity'])

const UrlStateSchema = z.object({
	v: z.coerce.number().int().positive().default(1),
	topic: TopicSchema.optional(),
	year: z
		.string()
		.regex(/^\\d{4}$/)
		.optional(),
	country: z.string().trim().min(1).optional(),
	region: z.string().trim().min(1).optional(),
	bbox: z
		.string()
		.regex(/^-?\\d+(\\.\\d+)?,-?\\d+(\\.\\d+)?,-?\\d+(\\.\\d+)?,-?\\d+(\\.\\d+)?$/)
		.optional(),
	wkid: z.coerce.number().int().positive().optional(),
})

export type UrlState = z.infer<typeof UrlStateSchema>
```

Regeln:

- Kein any
- Keine non-null assertions
- Keine ungesicherten Casts
- Parse immer mit safeParse

## Architekturprinzip: Hydration von Runtime-Updates trennen

## Phase A - Initial Hydration (einmalig)

Beim App-Start:

1. URL lesen und validieren
2. Undefinierte/ungueltige Werte auf Defaults mappen
3. Store initial setzen (Thema, Jahr, Filter)
4. Karte erst danach initial positionieren (bbox oder Fallback)
5. URL direkt kanonisieren (replaceState)

Wichtig: Diese Phase laeuft genau einmal pro App-Start.

## Phase B - Runtime Sync (laufend)

Nach erfolgreicher Hydration:

1. Store-Aenderungen in URL spiegeln
2. Kartenkamera nur bei ruhigem Zustand schreiben
3. history.replaceState fuer laufende Aenderungen nutzen
4. history.pushState nur fuer explizite Navigationsschritte nutzen

Wichtig: Runtime-Sync darf nie erneut Hydration triggern.

## Kartenzustand: nur im ruhigen Zustand schreiben

WebMap/Kamera-Werte (bbox, center, zoom, rotation) nur schreiben wenn:

- view.stationary true ist
- view.interacting false ist
- view.updating false ist

Zusatz:

- Schreibvorgaenge drosseln (throttle/debounce)
- Numerische Werte fuer URL runden (stabile, kurze Links)
- Nur schreiben, wenn sich der serialisierte URL-State wirklich geaendert hat

## Prioritaetsregeln fuer Geo-Einstieg

Lege pro App eine feste Prioritaet fest, damit keine widerspruechlichen Kameraspruenge entstehen.

Wichtig:

- Die Reihenfolge ist fachlich und app-spezifisch (kein globales Default fuer alle Apps)
- Genau eine Quelle darf die initiale Kamera setzen
- Die Regel muss dokumentiert und in Tests abgesichert sein

Beispielmuster (je nach App-Typ):

1. Praeziser Kartenausschnitt zuerst: bbox + wkid -> region -> country -> WebMap-Default
2. Fachlicher Kontext zuerst: region -> country -> bbox + wkid -> WebMap-Default
3. Einfaches Filter-zentriertes Dashboard: country -> region -> WebMap-Default

Waehle genau ein Muster fuer die jeweilige App und setze es konsistent um.

## Guard Rails gegen Feedback-Loops

- Interne Guard-Flags verwenden (isHydrating, isSyncingUrl, isApplyingMapState)
- URL-Write nicht ausloesen, waehrend URL gerade angewendet wird
- Map-goTo nicht erneut starten, wenn Ziel bereits aktiv ist

## Daten- und Sicherheitsregeln

- Parameter whitelisten, unbekannte Parameter ignorieren
- Keine rohen URL-Werte direkt in SQL/where-Strings uebernehmen
- Werte vor Layer-Filtern escapen
- Keine sensitiven Daten in URL speichern (Token, User-Info)

## UX-Regeln

- Deeplink soll sofort sichtbare Wirkung haben (Thema/Jahr/Karte)
- Bei ungueltigen Parametern still auf Defaults fallen, nicht crashen
- Optional: kurzes Feedback im UI (z. B. Invalid URL values were normalized)

## Test-Checkliste

Mindestens diese Faelle testen:

1. Nur topic gesetzt
2. topic + year gesetzt
3. Voller Link mit bbox + wkid
4. Ungueltiger topic
5. Ungueltige bbox
6. Reload mit bestehendem Link
7. Browser Back/Forward
8. Schnelles Panning/Zooming ohne URL-Spam

## Schritt-fuer-Schritt Umsetzung

1. URL-Schema als Zod definieren
2. URL-Parser + Serializer als Utility kapseln
3. Hydration-Hook fuer Initialzustand erstellen
4. Runtime-Sync-Hook fuer Store und URL erstellen
5. Map-Sync-Hook fuer stationaeren Kamera-Write erstellen
6. Guards und Equality-Checks ergaenzen
7. Tests fuer Parsing, Normalisierung und Sync-Verhalten implementieren

## Ergebnis

Nach Anwendung dieses Skills ist die App deeplink-faehig, robust gegen ungueltige Eingaben und stabil in der Synchronisierung zwischen Store, URL und ArcGIS-WebMap-Kamera.