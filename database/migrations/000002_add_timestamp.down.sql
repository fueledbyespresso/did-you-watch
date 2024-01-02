alter table movie_user_bridge
    drop constraint if exists movie_user_bridge_pk;

alter table movie_user_bridge
    drop column if exists timestamp;

alter table movie_user_bridge
    add constraint movie_user_bridge_pk
        primary key (user_id, movie_id);


alter table tv_user_bridge
    drop constraint if exists  tv_user_bridge_pk;

alter table tv_user_bridge
    drop column if exists timestamp;

alter table tv_user_bridge
    add constraint tv_user_bridge_pk
        primary key (user_id, tv_id);

