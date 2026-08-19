-- Ajoute le statut "Corbeille" aux objets trouvés, pour permettre aux agents
-- de déplacer un objet vers la corbeille (au lieu de le supprimer
-- définitivement) sans casser les statuts existants.

ALTER TABLE public.lost_found_items
  DROP CONSTRAINT IF EXISTS lost_found_items_status_check;

ALTER TABLE public.lost_found_items
  ADD CONSTRAINT lost_found_items_status_check
  CHECK (status IN ('En attente', 'Restitué', 'Transféré', 'Corbeille'));
