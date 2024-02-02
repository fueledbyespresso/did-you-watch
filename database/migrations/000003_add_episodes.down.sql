drop table if exists episode_user_bridge;
drop table if exists episode;
alter table tv
    add column if not exists total_episodes integer default 0 not null;