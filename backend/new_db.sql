-- CREATE DATABASE locomotive_quiz;
USE locomotive_quiz;

CREATE TABLE images (
  source VARCHAR(256),
  model VARCHAR(100),
  archive_url VARCHAR(256)
);

CREATE TABLE models (
  model VARCHAR(100),
  manufacturer VARCHAR(256),
  archive_url VARCHAR(256),
  wikipedia_url VARCHAR(256)
);

CREATE TABLE manufacturers (
  name VARCHAR(256),
  archive_url VARCHAR(256),
  wikipedia_url VARCHAR(256)
);
