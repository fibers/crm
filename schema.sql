create database if not exists crm;

use crm;

drop table if exists admins;
create table admins(
    id int(11) primary key auto_increment,
    username varchar(255) not null,
    password char(32) not null,
    is_super_admin tinyint(1) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
create unique index idx_admin_username on admins (username);
insert into admins values (null, 'root', 'c4ca4238a0b923820dcc509a6f75849b' , 1, now(), now());

drop table if exists logs;
create table logs(
    id int(11) primary key auto_increment,
    operator varchar(255) not null,
    url varchar(255) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
create index idx_log_operator on logs (operator);

drop table if exists categories;
create table categories(
    id int(11) primary key auto_increment,
    title varchar(255) not null,
    level smallint(1) not null,
    parent_id int(11) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
create unique index idx_category_title on categories (title);

drop table if exists languages;
create table languages(
    id int(11) primary key auto_increment,
    iso_code char(2) not null,
    title varchar(255) not null,
    status tinyint(1) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
create unique index idx_language_iso_code on languages (iso_code);
insert into languages values (null, 'en', 'English' , 1, now(), now());

drop table if exists commodity_reports;
create table commodity_reports(
    id int(11) primary key auto_increment,
    commodity_id int(11) not null,
    reporter_id int(11) not null,
    is_processed tinyint(1) not null,
    reason int(11) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists user_reports;
create table user_reports(
    id int(11) primary key auto_increment,
    user_id int(11) not null,
    reporter_id int(11) not null,
    is_processed tinyint(1) not null,
    reason int(11) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists tags;
create table tags(
    id int(11) primary key auto_increment,
    title varchar(255) not null,
    status tinyint(1) not null,
    created_at datetime not null,
    updated_at datetime not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

drop table if exists commodity_tags;
create table commodity_tags(
    product_id int(11) not null,
    tag_id int(11) not null
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
create index idx_commodity_tag_product_id_tag_id on commodity_tags (product_id, tag_id);