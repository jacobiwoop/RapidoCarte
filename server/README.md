# VerifCode Server

Ce dossier contient le backend de l'application VerifCode.

## Prérequis

- Node.js
- NPM

## Installation

```bash
cd server
npm install
```

## Base de données

La base de données SQLite est initialisée avec Prisma.

Pour réinitialiser ou mettre à jour la base de données :

```bash
npx prisma migrate dev
npx ts-node src/seed.ts  # Pour remplir les données initiales
```

## Lancement

Pour lancer le serveur en développement :

```bash
npm run dev
```

Le serveur tourne sur le port `3001` par défaut.
Le frontend (Vite) doit être configuré pour proxy les requêtes `/api` vers `http://localhost:3001`.
