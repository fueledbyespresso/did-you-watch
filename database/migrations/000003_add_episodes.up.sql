create table IF NOT EXISTS episode
(
    season_number         integer,
    episode_number integer not null,
    tv_id integer
        constraint episode_tv_id_fk
            references tv
            on delete cascade,
        constraint episode_pk
            primary key (episode_number, season_number, tv_id),
    title varchar
);

create table IF NOT EXISTS episode_user_bridge
(
    season_number integer,
    episode_number integer,
    tv_id         integer
        constraint episode_user_bridge_tv_id_fk
            references tv on delete cascade,
    user_id       varchar(2048)
        constraint episode_user_bridge_account_uid_fk
            references account,
    timestamp timestamp default now() not null,
    constraint episode_user_bridge_episode_season_episode_number_tv_id_fk
        foreign key (season_number, episode_number, tv_id) references episode (season_number, episode_number, tv_id),
    constraint episode_user_bridge_pk
        primary key (season_number, episode_number, user_id, tv_id)
);

alter table tv
    drop column if exists total_episodes;