# Fonctionnalités d'Export/Import d'Indices

## Vue d'ensemble

Les nouvelles fonctionnalités d'export et d'import permettent de sauvegarder et restaurer le contenu complet d'un index Elasticsearch, incluant les documents et le mapping.

## Fonctionnalités ajoutées

### 🔄 Export d'Index

**Localisation :** Menu contextuel de chaque index → "Exporter l'index"

**Fonctionnalités :**
- Export de tous les documents d'un index
- Option d'inclure/exclure le mapping
- Compression ZIP optionnelle
- Écran de progression en temps réel
- Téléchargement automatique du fichier

**Formats supportés :**
- JSON brut (`.json`)
- Archive ZIP compressée (`.zip`)

**Structure du fichier d'export :**
```json
{
  "index": "nom_de_l_index",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "mapping": { /* mapping Elasticsearch */ },
  "documents": [
    {
      "_id": "document_id",
      "_source": { /* contenu du document */ }
    }
  ],
  "total": 1000
}
```

### 📥 Import d'Index

**Localisation :** Menu contextuel de chaque index → "Importer l'index"

**Fonctionnalités :**
- Import depuis fichier JSON ou ZIP
- Création d'un nouvel index ou import dans un index existant
- Aperçu du fichier avant import
- Validation de la structure du fichier
- Écran de progression détaillé
- Gestion des erreurs avec rapport

**Options d'import :**
- **Nouvel index :** Crée un nouvel index avec le nom spécifié
- **Index existant :** Importe dans un index existant (avec option d'écrasement)
- **Options avancées :** Écrasement des documents existants

## Interface Utilisateur

### Dialog d'Export
- ✅ Inclure le mapping
- ✅ Compresser le fichier (ZIP)
- ⚠️ Avertissement pour les gros index

### Dialog d'Import
- 📁 Sélection de fichier (.json ou .zip)
- 🔄 Mode d'import (nouvel index / index existant)
- 📝 Nom du nouvel index
- 📋 Sélection d'index existant
- ⚙️ Options avancées
- 👁️ Aperçu du fichier

### Écrans de Progression
- 📊 Barre de progression visuelle
- 📈 Statistiques en temps réel (documents traités/total)
- 📝 Statut détaillé de l'opération
- ❌ Gestion des erreurs avec messages explicites

## Implémentation Technique

### Composants ajoutés
- `src/components/indices/IndexExport.vue` - Composant d'export
- `src/components/indices/IndexImport.vue` - Composant d'import

### Méthodes ElasticsearchAdapter
- `indexDump()` - Export avec progression
- `indexRestore()` - Import avec progression

### Dépendances ajoutées
- `jszip` - Compression/décompression ZIP
- `@types/jszip` - Types TypeScript

### Traductions
- Anglais (`src/locales/en.json`)
- Français (`src/locales/fr.json`)

## Utilisation

### Export d'un index
1. Aller dans la section "Indices"
2. Cliquer sur le menu (⚙️) d'un index
3. Sélectionner "Exporter l'index"
4. Choisir les options (mapping, compression)
5. Cliquer sur "Commencer l'export"
6. Suivre la progression
7. Le fichier se télécharge automatiquement

### Import d'un index
1. Aller dans la section "Indices"
2. Cliquer sur le menu (⚙️) d'un index
3. Sélectionner "Importer l'index"
4. Sélectionner le fichier de dump
5. Choisir le mode d'import
6. Configurer les options
7. Cliquer sur "Commencer l'import"
8. Suivre la progression

## Gestion des Erreurs

### Erreurs d'export
- Échec de connexion au cluster
- Index inexistant
- Permissions insuffisantes
- Erreurs de téléchargement

### Erreurs d'import
- Fichier corrompu ou invalide
- Index déjà existant (si non autorisé)
- Permissions insuffisantes
- Erreurs de mapping
- Erreurs de documents individuels

## Limitations

- Les très gros index peuvent prendre du temps à exporter/importer
- L'export utilise l'API scroll d'Elasticsearch (limite de 10k documents par batch)
- L'import utilise l'API bulk (limite de 1k documents par batch)
- Les métadonnées d'index (settings, aliases) ne sont pas exportées

## Sécurité

- Validation stricte des fichiers d'import
- Vérification de la structure JSON
- Gestion sécurisée des erreurs
- Pas d'exécution de code arbitraire

## Performance

- Export/import par chunks pour éviter les timeouts
- Progression en temps réel
- Gestion mémoire optimisée
- Compression ZIP pour réduire la taille des fichiers
