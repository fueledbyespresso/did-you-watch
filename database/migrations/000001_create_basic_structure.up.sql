create table if not exists schema_migrations
(
    version bigint  not null
        primary key,
    dirty   boolean not null
);

create table if not exists http_sessions
(
    id          bigserial
        primary key,
    key         bytea,
    data        bytea,
    created_on  timestamp with time zone default CURRENT_TIMESTAMP,
    modified_on timestamp with time zone,
    expires_on  timestamp with time zone
);

create index if not exists http_sessions_expiry_idx
    on http_sessions (expires_on);

create index if not exists http_sessions_key_idx
    on http_sessions (key);

create table if not exists tv
(
    id             integer           not null
        constraint tv_pk
            primary key,
    name           varchar,
    poster_path    varchar,
    overview       varchar,
    total_episodes integer default 0 not null,
    backdrop_path  varchar
);

create table if not exists movie
(
    id            integer not null
        constraint movie_pk
            primary key,
    name          varchar not null,
    poster_path   varchar,
    overview      varchar,
    backdrop_path varchar
);

create table if not exists avatar
(
    id        integer not null
        constraint avatar_pk
            primary key,
    image_url varchar not null
);

create table if not exists account
(
    uid                 varchar(2048)         not null
        constraint account_uid_pk
            primary key,
    email               varchar(150)          not null,
    username            varchar(20)           not null
        constraint account_username_pk
            unique
        constraint check_username
            check (length((username)::text) > 0),
    display_name        varchar(20)           not null
        constraint check_display_name
            check (length((display_name)::text) > 0),
    profile_picture_url integer default 1
        constraint account_avatar_id_fk
            references avatar
            on delete set null,
    dark_mode           boolean default false not null
);

create unique index if not exists account_email_uindex
    on account (email);

create unique index if not exists account_uuid_uindex
    on account (uid);

create table if not exists tv_user_bridge
(
    tv_id            integer           not null
        constraint tv_user_bridge_tv_id_fk
            references tv
            on delete cascade,
    user_id          varchar           not null
        constraint tv_user_bridge_account_uid_fk
            references account
            on delete cascade,
    status           varchar
        constraint check_name
            check (((status)::text = 'plan-to-watch'::text) OR ((status)::text = 'completed'::text) OR
                   ((status)::text = 'started'::text) OR ((status)::text = 'dropped'::text) OR
                   ((status)::text = 'rewatching'::text)),
    episodes_watched integer default 0 not null,
    constraint tv_user_bridge_pk
        primary key (tv_id, user_id)
);

create table if not exists movie_user_bridge
(
    movie_id integer                                            not null
        constraint movie_user_bridge_movie_id_fk
            references movie
            on delete cascade,
    user_id  varchar                                            not null
        constraint movie_user_bridge_account_uid_fk
            references account,
    status   varchar default 'plan-to-watch'::character varying not null
        constraint check_name
            check (((status)::text = 'plan-to-watch'::text) OR ((status)::text = 'completed'::text) OR
                   ((status)::text = 'started'::text) OR ((status)::text = 'dropped'::text) OR
                   ((status)::text = 'rewatching'::text)),
    constraint movie_user_bridge_pk
        primary key (user_id, movie_id)
);

