-- This file creates the tables for standard operation

CREATE TABLE `user` (
	`user_id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL UNIQUE,
	`pass`	TEXT NOT NULL,
	`enabled`	INTEGER NOT NULL DEFAULT 1,
	`disabled_message`	TEXT,
	`created_date`	TEXT NOT NULL DEFAULT 'DATETIME(''now'')',
	`last_accessed_date`	TEXT NOT NULL DEFAULT 'DATETIME(''now'')',
	`deleted`	INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE `user_perm` (
	`user_id`	INTEGER NOT NULL,
	`perm_id`	INTEGER NOT NULL,
	`value`	TEXT NOT NULL CHECK(`value` != ''),
	PRIMARY KEY(`user_id`,`perm_id`)
);

CREATE TABLE `perm` (
	`perm_id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL UNIQUE,
	`description`	TEXT NOT NULL CHECK(description != '')
);

CREATE TABLE `session` (
	`user_id`	INTEGER NOT NULL,
	`session`	TEXT NOT NULL,
	`expires_date`	TEXT NOT NULL CHECK(`expires_date` > DATETIME ( 'now' )),
	`address`	TEXT NOT NULL
);

CREATE TABLE `room` (
	`room_id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`owner_id`	INTEGER NOT NULL,
	`name`	TEXT NOT NULL UNIQUE,
	`secret`	TEXT,
	`public`	INTEGER NOT NULL DEFAULT 0,
	`description`	TEXT,
	`created_date`	TEXT NOT NULL DEFAULT 'DATETIME(''now'')',
	`max_visitors`	INTEGER NOT NULL DEFAULT 0
);

INSERT INTO `perm` VALUES (0, 'admin', 'User is a site administrator');
