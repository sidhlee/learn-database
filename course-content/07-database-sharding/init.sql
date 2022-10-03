-- We want this to be executed when docker runs the container
CREATE TABLE URL_TABLE
(
  id serial NOT NULL PRIMARY KEY,
  URL text,
  URL_ID character(5)
)