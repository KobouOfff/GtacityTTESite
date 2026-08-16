-- Ajoute les lignes de bus B1 (Centre-Ville) et B2 (Secteur Rural) à la table
-- des services horaires, pour qu'elles apparaissent dans la Régulation des
-- départs (Centre de Régulation) au même titre que les trains.

-- 1) Autoriser les nouveaux codes de ligne dans la contrainte existante.
alter table public.timetable_services drop constraint if exists timetable_line_check;
alter table public.timetable_services add constraint timetable_line_check
  check (line in ('R1','R2','R3','R4','IC1','IC2','T','BUS','B1','B2'));

-- 2) Ligne B1 — Boucle Centre-Ville (circuit fermé), toutes les 20 min de 06:00 à 22:00.
--    8 arrêts, retour au dépôt après le dernier arrêt (~40 min de tour complet).
insert into public.timetable_services
  (id, line, service_name, origin_slug, destination_slug, departure_time, arrival_time, stops)
select
  'B1-' || to_char(t, 'HH24MI'),
  'B1',
  'Boucle Centre-Ville',
  'depot-bus',
  'mairie',
  t::time,
  (t + interval '40 minutes')::time,
  '[
    {"slug":"depot-bus","name":"Dépôt Bus","offset":0},
    {"slug":"motel-prison","name":"Motel / Prison","offset":5},
    {"slug":"zone-indus","name":"Zone Indus.","offset":10},
    {"slug":"hopital-b1","name":"Hôpital","offset":16},
    {"slug":"concession","name":"Concession","offset":22},
    {"slug":"arlington","name":"Arlington","offset":28},
    {"slug":"gare-diner","name":"Gare / Diner","offset":34},
    {"slug":"mairie","name":"Mairie","offset":40}
  ]'::jsonb
from generate_series(
  timestamp '2000-01-01 06:00',
  timestamp '2000-01-01 22:00',
  interval '20 minutes'
) as t
on conflict (id) do update set
  line = excluded.line,
  service_name = excluded.service_name,
  origin_slug = excluded.origin_slug,
  destination_slug = excluded.destination_slug,
  departure_time = excluded.departure_time,
  arrival_time = excluded.arrival_time,
  stops = excluded.stops,
  active = true,
  updated_at = now();

-- 3) Ligne B2 — Navette Secteur Rural (aller), toutes les 40 min de 06:00 à 20:00.
--    5 arrêts, Dépôt Bus -> Station Service (~25 min par trajet).
insert into public.timetable_services
  (id, line, service_name, origin_slug, destination_slug, departure_time, arrival_time, stops)
select
  'B2-' || to_char(t, 'HH24MI'),
  'B2',
  'Navette Secteur Rural',
  'depot-bus',
  'station-service',
  t::time,
  (t + interval '25 minutes')::time,
  '[
    {"slug":"depot-bus","name":"Dépôt Bus","offset":0},
    {"slug":"ferme","name":"Ferme","offset":6},
    {"slug":"fire-dept","name":"Fire Dept.","offset":12},
    {"slug":"camp-voyage","name":"Camp Voyage","offset":18},
    {"slug":"station-service","name":"Station Service","offset":25}
  ]'::jsonb
from generate_series(
  timestamp '2000-01-01 06:00',
  timestamp '2000-01-01 20:00',
  interval '40 minutes'
) as t
on conflict (id) do update set
  line = excluded.line,
  service_name = excluded.service_name,
  origin_slug = excluded.origin_slug,
  destination_slug = excluded.destination_slug,
  departure_time = excluded.departure_time,
  arrival_time = excluded.arrival_time,
  stops = excluded.stops,
  active = true,
  updated_at = now();

-- 4) Ligne B2 — retour (Station Service -> Dépôt Bus), même fréquence, décalé de 20 min.
insert into public.timetable_services
  (id, line, service_name, origin_slug, destination_slug, departure_time, arrival_time, stops)
select
  'B2-RET-' || to_char(t, 'HH24MI'),
  'B2',
  'Navette Secteur Rural (retour)',
  'station-service',
  'depot-bus',
  t::time,
  (t + interval '25 minutes')::time,
  '[
    {"slug":"station-service","name":"Station Service","offset":0},
    {"slug":"camp-voyage","name":"Camp Voyage","offset":7},
    {"slug":"fire-dept","name":"Fire Dept.","offset":13},
    {"slug":"ferme","name":"Ferme","offset":19},
    {"slug":"depot-bus","name":"Dépôt Bus","offset":25}
  ]'::jsonb
from generate_series(
  timestamp '2000-01-01 06:20',
  timestamp '2000-01-01 20:20',
  interval '40 minutes'
) as t
on conflict (id) do update set
  line = excluded.line,
  service_name = excluded.service_name,
  origin_slug = excluded.origin_slug,
  destination_slug = excluded.destination_slug,
  departure_time = excluded.departure_time,
  arrival_time = excluded.arrival_time,
  stops = excluded.stops,
  active = true,
  updated_at = now();
