create table if not exists public.timetable_services (
  id text primary key,
  line text not null,
  service_name text not null,
  origin_slug text not null,
  destination_slug text not null,
  departure_time time not null,
  arrival_time time not null,
  days_of_week smallint[] not null default array[0,1,2,3,4,5,6]::smallint[],
  stops jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timetable_line_check check (line in ('R1','R2','R3','R4','IC1','IC2','T','BUS')),
  constraint timetable_stops_array check (jsonb_typeof(stops) = 'array')
);

create table if not exists public.timetable_service_updates (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.timetable_services(id) on delete cascade,
  service_date date not null,
  status text not null default 'on_time',
  delay_minutes integer not null default 0,
  platform_override text,
  public_message text,
  updated_by_discord_id text not null,
  updated_by_name text not null,
  updated_at timestamptz not null default now(),
  unique(service_id, service_date),
  constraint timetable_status_check check (status in ('on_time','boarding','delayed','platform_changed','cancelled')),
  constraint timetable_delay_check check (delay_minutes between 0 and 360)
);

create index if not exists timetable_services_active_idx
  on public.timetable_services(active, line, departure_time);
create index if not exists timetable_updates_date_idx
  on public.timetable_service_updates(service_date, service_id);

alter table public.timetable_services enable row level security;
alter table public.timetable_service_updates enable row level security;

drop policy if exists "Service role manages timetable services" on public.timetable_services;
create policy "Service role manages timetable services"
  on public.timetable_services for all to service_role using (true) with check (true);
drop policy if exists "Service role manages timetable updates" on public.timetable_service_updates;
create policy "Service role manages timetable updates"
  on public.timetable_service_updates for all to service_role using (true) with check (true);

insert into public.timetable_services
  (id,line,service_name,origin_slug,destination_slug,departure_time,arrival_time,stops)
values
('R1-0730','R1','Smokies régional 101','townsend','sevierville','07:30','08:25','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"pigeon-forge","name":"Pigeon Forge","offset":35,"platform":"1"},{"slug":"sevierville","name":"Sevierville","offset":55,"platform":"2"}]'),
('R1-1330','R1','Smokies régional 105','townsend','sevierville','13:30','14:25','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"pigeon-forge","name":"Pigeon Forge","offset":35,"platform":"1"},{"slug":"sevierville","name":"Sevierville","offset":55,"platform":"2"}]'),
('R1-1830','R1','Smokies régional 109','townsend','sevierville','18:30','19:25','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"pigeon-forge","name":"Pigeon Forge","offset":35,"platform":"1"},{"slug":"sevierville","name":"Sevierville","offset":55,"platform":"2"}]'),
('R2-0615','R2','Foothills régional 202','townsend','mascot','06:15','08:12','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"maryville","name":"Maryville","offset":25,"platform":"2"},{"slug":"alcoa","name":"Alcoa","offset":39,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":65,"platform":"3"},{"slug":"strawberry-plains","name":"Strawberry Plains","offset":94,"platform":"1"},{"slug":"mascot","name":"Mascot","offset":117,"platform":"1"}]'),
('R2-1215','R2','Foothills régional 206','townsend','mascot','12:15','14:12','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"maryville","name":"Maryville","offset":25,"platform":"2"},{"slug":"alcoa","name":"Alcoa","offset":39,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":65,"platform":"3"},{"slug":"strawberry-plains","name":"Strawberry Plains","offset":94,"platform":"1"},{"slug":"mascot","name":"Mascot","offset":117,"platform":"1"}]'),
('R2-1715','R2','Foothills régional 210','townsend','mascot','17:15','19:12','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"maryville","name":"Maryville","offset":25,"platform":"2"},{"slug":"alcoa","name":"Alcoa","offset":39,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":65,"platform":"3"},{"slug":"strawberry-plains","name":"Strawberry Plains","offset":94,"platform":"1"},{"slug":"mascot","name":"Mascot","offset":117,"platform":"1"}]'),
('R3-0810','R3','East Tennessee 301','knoxville','greeneville','08:10','10:18','[{"slug":"knoxville","name":"Knoxville","offset":0,"platform":"4"},{"slug":"jefferson-city","name":"Jefferson City","offset":43,"platform":"1"},{"slug":"morristown","name":"Morristown","offset":76,"platform":"2"},{"slug":"greeneville","name":"Greeneville","offset":128,"platform":"1"}]'),
('R3-1610','R3','East Tennessee 305','knoxville','greeneville','16:10','18:18','[{"slug":"knoxville","name":"Knoxville","offset":0,"platform":"4"},{"slug":"jefferson-city","name":"Jefferson City","offset":43,"platform":"1"},{"slug":"morristown","name":"Morristown","offset":76,"platform":"2"},{"slug":"greeneville","name":"Greeneville","offset":128,"platform":"1"}]'),
('R4-0700','R4','Southern régional 401','townsend','chattanooga','07:00','10:21','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":61,"platform":"5"},{"slug":"lenoir-city","name":"Lenoir City","offset":91,"platform":"1"},{"slug":"sweetwater","name":"Sweetwater","offset":121,"platform":"1"},{"slug":"athens","name":"Athens","offset":151,"platform":"2"},{"slug":"cleveland","name":"Cleveland","offset":176,"platform":"1"},{"slug":"chattanooga","name":"Chattanooga","offset":201,"platform":"3"}]'),
('R4-1500','R4','Southern régional 405','townsend','chattanooga','15:00','18:21','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":61,"platform":"5"},{"slug":"lenoir-city","name":"Lenoir City","offset":91,"platform":"1"},{"slug":"sweetwater","name":"Sweetwater","offset":121,"platform":"1"},{"slug":"athens","name":"Athens","offset":151,"platform":"2"},{"slug":"cleveland","name":"Cleveland","offset":176,"platform":"1"},{"slug":"chattanooga","name":"Chattanooga","offset":201,"platform":"3"}]'),
('IC1-0800','IC1','Cumberland InterCité 501','townsend','nashville','08:00','12:10','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":62,"platform":"6"},{"slug":"oak-ridge","name":"Oak Ridge","offset":92,"platform":"1"},{"slug":"crossville","name":"Crossville","offset":158,"platform":"1"},{"slug":"cookeville","name":"Cookeville","offset":196,"platform":"2"},{"slug":"lebanon","name":"Lebanon","offset":228,"platform":"1"},{"slug":"nashville","name":"Nashville","offset":250,"platform":"4"}]'),
('IC1-1500','IC1','Cumberland InterCité 505','townsend','nashville','15:00','19:10','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"knoxville","name":"Knoxville","offset":62,"platform":"6"},{"slug":"oak-ridge","name":"Oak Ridge","offset":92,"platform":"1"},{"slug":"crossville","name":"Crossville","offset":158,"platform":"1"},{"slug":"cookeville","name":"Cookeville","offset":196,"platform":"2"},{"slug":"lebanon","name":"Lebanon","offset":228,"platform":"1"},{"slug":"nashville","name":"Nashville","offset":250,"platform":"4"}]'),
('IC2-0640','IC2','Smoky Express 602','townsend','nashville','06:40','10:00','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"maryville","name":"Maryville","offset":24,"platform":"2"},{"slug":"knoxville","name":"Knoxville","offset":57,"platform":"6"},{"slug":"cookeville","name":"Cookeville","offset":150,"platform":"2"},{"slug":"lebanon","name":"Lebanon","offset":180,"platform":"1"},{"slug":"nashville","name":"Nashville","offset":200,"platform":"5"}]'),
('IC2-1240','IC2','Smoky Express 606','townsend','nashville','12:40','16:00','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"maryville","name":"Maryville","offset":24,"platform":"2"},{"slug":"knoxville","name":"Knoxville","offset":57,"platform":"6"},{"slug":"cookeville","name":"Cookeville","offset":150,"platform":"2"},{"slug":"lebanon","name":"Lebanon","offset":180,"platform":"1"},{"slug":"nashville","name":"Nashville","offset":200,"platform":"5"}]'),
('IC2-1840','IC2','Smoky Express 610','townsend','nashville','18:40','22:00','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"maryville","name":"Maryville","offset":24,"platform":"2"},{"slug":"knoxville","name":"Knoxville","offset":57,"platform":"6"},{"slug":"cookeville","name":"Cookeville","offset":150,"platform":"2"},{"slug":"lebanon","name":"Lebanon","offset":180,"platform":"1"},{"slug":"nashville","name":"Nashville","offset":200,"platform":"5"}]'),
('T-0600','T','Townsend 701','townsend','hopital-tmc','06:00','06:18','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"quartier-arlington","name":"Quartier Arlington","offset":8,"platform":"A"},{"slug":"hopital-tmc","name":"Hôpital TMC","offset":18,"platform":"H"}]'),
('T-0800','T','Townsend 705','townsend','hopital-tmc','08:00','08:18','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"quartier-arlington","name":"Quartier Arlington","offset":8,"platform":"A"},{"slug":"hopital-tmc","name":"Hôpital TMC","offset":18,"platform":"H"}]'),
('T-1200','T','Townsend 711','townsend','hopital-tmc','12:00','12:18','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"quartier-arlington","name":"Quartier Arlington","offset":8,"platform":"A"},{"slug":"hopital-tmc","name":"Hôpital TMC","offset":18,"platform":"H"}]'),
('T-1600','T','Townsend 717','townsend','hopital-tmc','16:00','16:18','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"quartier-arlington","name":"Quartier Arlington","offset":8,"platform":"A"},{"slug":"hopital-tmc","name":"Hôpital TMC","offset":18,"platform":"H"}]'),
('T-2000','T','Townsend 723','townsend','hopital-tmc','20:00','20:18','[{"slug":"townsend","name":"Townsend","offset":0,"platform":"1"},{"slug":"quartier-arlington","name":"Quartier Arlington","offset":8,"platform":"A"},{"slug":"hopital-tmc","name":"Hôpital TMC","offset":18,"platform":"H"}]')
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
