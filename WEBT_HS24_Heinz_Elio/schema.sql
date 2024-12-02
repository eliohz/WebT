-- Erstellen der Datenbank (falls noch nicht vorhanden)
CREATE DATABASE IF NOT EXISTS linux_permissions;
USE linux_permissions;

-- Erstellen der Tabelle `permissions`
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- Eindeutige ID für jede Berechtigung
    symbolic VARCHAR(9) NOT NULL,              -- Symbolische Berechtigungen (z.B. rwxrwxrwx)
    numeric VARCHAR(3) NOT NULL,               -- Numerische Berechtigungen (z.B. 777)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatisches Datum und Uhrzeit der Erstellung
);

-- Alle möglichen Linux-Berechtigungen einfügen
INSERT INTO permissions (symbolic, numeric)
VALUES
-- Besitzer-Berechtigungen
('rwxrwxrwx', '777'),
('rwxrwxrw-', '776'),
('rwxrwxr--', '774'),
('rwxrwx---', '770'),
('rwxrw-rw-', '766'),
('rwxrw-r--', '764'),
('rwxrw----', '760'),
('rwxr--rw-', '746'),
('rwxr--r--', '744'),
('rwxr-----', '740'),
('rw-rw-rw-', '666'),
('rw-rw-r--', '664'),
('rw-rw----', '660'),
('rw-r--rw-', '646'),
('rw-r--r--', '644'),
('rw-r-----', '640'),
('r--r--r--', '444'),
('r--r--rw-', '446'),
('r--rw----', '440'),
('rw-------', '600'),
('r--------', '400'),
('---------', '000');
