CREATE DATABASE IF NOT EXISTS linux_permissions;
USE linux_permissions;

CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbolic VARCHAR(9) NOT NULL,
    `numeric` VARCHAR(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO permissions (symbolic, `numeric`)
VALUES
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
