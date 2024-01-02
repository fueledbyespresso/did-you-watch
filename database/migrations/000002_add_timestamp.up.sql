alter table movie_user_bridge
    add timestamp timestamp default now() not null;

alter table movie_user_bridge
    drop constraint movie_user_bridge_pk;

alter table movie_user_bridge
    add constraint movie_user_bridge_pk
        primary key (user_id, movie_id, timestamp);



alter table tv_user_bridge
    add timestamp timestamp default now() not null;

alter table tv_user_bridge
    drop constraint tv_user_bridge_pk;

alter table tv_user_bridge
    add constraint tv_user_bridge_pk
        primary key (user_id, tv_id, timestamp);
