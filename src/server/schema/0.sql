-- This file creates the basics for a new installation

CREATE TABLE `schema` (
	`version` INTEGER NOT NULL DEFAULT 0
);

INSERT INTO `schema` VALUES (-1);
