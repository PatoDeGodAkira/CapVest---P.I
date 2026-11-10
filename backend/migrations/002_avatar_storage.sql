-- Execute uma vez em bancos já existentes para suportar fotos de perfil em base64.
ALTER TABLE users MODIFY avatar_url MEDIUMTEXT NULL;
