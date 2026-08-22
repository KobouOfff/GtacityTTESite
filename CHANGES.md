# Fichiers modifiés / ajoutés — Attribution des billets par référence client

## Nouveaux fichiers
- supabase/migrations/20260823120000_add_purchase_reference_delivery.sql
  → ajoute reference, delivered_by_discord_id, delivered_by_username, delivered_at sur subscription_purchases
- src/routes/mon-compte.tsx
  → page client "Mon compte" : points fidélité + historique des achats avec référence
- src/components/BilletsPanel.tsx
  → outil employé : recherche par référence + bouton "Attribuer le billet"
- src/components/BilletsPanel.css
  → styles du panneau ci-dessus

## Fichiers modifiés
- src/lib/discord-roles.ts
  → ajout de canManageSubscriptions (tout employé connecté)
- src/lib/loyalty.server.ts
  → génération de référence (BIL-AAAA-XXXXXX), findPurchaseByReference, deliverPurchaseByReference
- src/lib/loyalty.functions.ts
  → server functions searchPurchaseByReference / deliverPurchaseByReferenceFn (protégées)
- src/pages-html/EspaceEmployes.tsx
  → bouton "Attribuer un billet" dans le portail employé
- src/pages-html/CentreRegulation.tsx
  → bouton "Attribuer un billet" dans la barre latérale du Centre de Régulation
- src/components/SubscriptionPayModal.tsx
  → affiche la référence d'achat au client juste après le paiement
- src/pages-html/Accueil.tsx
  → le badge fidélité devient un lien vers /mon-compte
- src/pages-html/Accueil.css
  → styles du bloc "référence" dans le modal de paiement

## À faire une fois déployé
- Appliquer la migration Supabase (fichier .sql ci-dessus)
- Copier chaque fichier à son même chemin dans le projet (écrase les fichiers existants)
