# Installation des PV partagés

Cette version remplace le stockage local de la section **Fraudeurs / PV** par
une table Supabase commune à tous les comptes connectés.

## 1. Créer la table Supabase

Dans Supabase :

1. Ouvrir **SQL Editor**.
2. Créer une nouvelle requête.
3. Copier tout le contenu du fichier `INSTALL_SUPABASE_PV.sql`.
4. Cliquer sur **Run**.

La requête crée la table `public.pv_records`, la numérotation automatique des
PV et une politique qui réserve l'accès direct à la clé serveur.

## 2. Vérifier les variables Vercel

Dans **Vercel > Project > Settings > Environment Variables**, les variables
suivantes doivent être présentes en Production :

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY` doit contenir la valeur `SUPABASE_SECRET_KEY`
fournie par Supabase. Elle ne doit jamais commencer par `VITE_`.

## 3. Déployer

Envoyer les fichiers de cette archive dans le dépôt GitHub du projet. Vercel
créera automatiquement un nouveau déploiement.

Après le déploiement :

1. Se connecter avec Discord.
2. Ouvrir **Centre de régulation > Fraudeurs / PV**.
3. Créer un PV depuis un premier compte.
4. Ouvrir ou actualiser la rubrique depuis un second compte.

La liste est également actualisée automatiquement toutes les 15 secondes tant
que la rubrique reste ouverte.

## Accès Direction aux demandes

Les rôles Discord suivants ont l'accès complet au suivi Direction des demandes
« Contact et aide », côté interface et côté serveur :

```text
1309838693900619937  Superviseur
1366488410046464081  Superviseur assistant
```

Après un changement de rôle Discord, il faut se déconnecter puis se reconnecter
au site pour renouveler les rôles enregistrés dans la session.

