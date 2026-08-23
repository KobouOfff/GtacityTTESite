-- Ajoute la colonne permettant de retenir l'ID du fil Discord
-- ("Dossier RH - NOM PRENOM") créé pour chaque dossier employé, afin
-- de mettre à jour ce même fil lors des sauvegardes suivantes au lieu
-- d'en recréer un nouveau à chaque fois.

ALTER TABLE public.hr_employee_files
  ADD COLUMN IF NOT EXISTS discord_thread_id text,
  ADD COLUMN IF NOT EXISTS discord_summary_message_id text;
