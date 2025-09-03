-- Schema optimizado para Supabase
-- Club Comandante Espora - Base de Datos

-- Eliminar tablas si existen (para recrear limpiamente)
DROP TABLE IF EXISTS cuotas CASCADE;
DROP TABLE IF EXISTS socios CASCADE;

-- Tabla Socios
CREATE TABLE socios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  actividad VARCHAR(20) CHECK (actividad IN ('Basquet', 'Voley', 'Karate', 'Gimnasio', 'Socio')),
  es_jugador BOOLEAN DEFAULT false,
  estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla Cuotas
CREATE TABLE cuotas (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_pago DATE,
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagada', 'Vencida', 'Anulada')),
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta')),
  numero_recibo VARCHAR(100),
  mercado_pago_id VARCHAR(255),
  link_pago TEXT,
  periodo VARCHAR(7), -- YYYY-MM format
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_socios_dni ON socios(dni);
CREATE INDEX idx_socios_email ON socios(email);
CREATE INDEX idx_socios_actividad ON socios(actividad);
CREATE INDEX idx_socios_estado ON socios(estado);
CREATE INDEX idx_cuotas_socio_id ON cuotas(socio_id);
CREATE INDEX idx_cuotas_estado ON cuotas(estado);
CREATE INDEX idx_cuotas_periodo ON cuotas(periodo);
CREATE INDEX idx_cuotas_fecha_vencimiento ON cuotas(fecha_vencimiento);

-- Función para actualizar updated_at automáticamente
-- Sintaxis corregida para Supabase
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_socios_updated_at 
    BEFORE UPDATE ON socios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cuotas_updated_at 
    BEFORE UPDATE ON cuotas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo para testing
INSERT INTO socios (nombre, apellido, dni, fecha_nacimiento, telefono, email, actividad, es_jugador, estado) VALUES
('Juan Carlos', 'Pérez López', '12345678', '1995-03-15', '+54 11 1234-5678', 'juan.perez@email.com', 'Basquet', true, 'Activo'),
('María Fernanda', 'González Silva', '23456789', '1998-07-22', '+54 11 2345-6789', 'maria.gonzalez@email.com', 'Basquet', true, 'Activo'),
('Carlos Alberto', 'Rodríguez Martín', '34567890', '1992-11-08', '+54 11 3456-7890', 'carlos.rodriguez@email.com', 'Voley', true, 'Activo'),
('Ana Sofía', 'Martínez Torres', '45678901', '1997-05-14', '+54 11 4567-8901', 'ana.martinez@email.com', 'Voley', true, 'Activo'),
('Diego Alejandro', 'López Fernández', '56789012', '1994-09-30', '+54 11 5678-9012', 'diego.lopez@email.com', 'Karate', true, 'Activo'),
('Lucía Isabel', 'Fernández García', '67890123', '1996-12-03', '+54 11 6789-0123', 'lucia.fernandez@email.com', 'Karate', true, 'Activo'),
('Miguel Ángel', 'García Ruiz', '78901234', '1993-08-17', '+54 11 7890-1234', 'miguel.garcia@email.com', 'Gimnasio', false, 'Activo'),
('Valeria Beatriz', 'Ruiz Morales', '89012345', '1999-01-25', '+54 11 8901-2345', 'valeria.ruiz@email.com', 'Gimnasio', false, 'Activo'),
('Sebastián Daniel', 'Morales Castro', '90123456', '1991-06-12', '+54 11 9012-3456', 'sebastian.morales@email.com', 'Socio', false, 'Activo'),
('Carolina Andrea', 'Castro Herrera', '01234567', '2000-04-08', '+54 11 0123-4567', 'carolina.castro@email.com', 'Basquet', true, 'Activo'),
('Fernando José', 'Herrera Vásquez', '11234567', '1990-11-22', '+54 11 1123-4567', 'fernando.herrera@email.com', 'Voley', true, 'Inactivo'),
('Gabriela Monserrat', 'Vásquez Jiménez', '22345678', '1995-07-04', '+54 11 2234-5678', 'gabriela.vasquez@email.com', 'Karate', true, 'Activo'),
('Rodrigo Maximiliano', 'Jiménez Aguirre', '33456789', '1998-03-16', '+54 11 3345-6789', 'rodrigo.jimenez@email.com', 'Gimnasio', false, 'Suspendido'),
('Camila Antonella', 'Aguirre Sánchez', '44567890', '1997-10-09', '+54 11 4456-7890', 'camila.aguirre@email.com', 'Socio', false, 'Activo'),
('Matías Ezequiel', 'Sánchez Rivera', '55678901', '1994-02-28', '+54 11 5567-8901', 'matias.sanchez@email.com', 'Basquet', true, 'Activo');

-- Insertar cuotas de ejemplo para algunos socios
INSERT INTO cuotas (socio_id, monto, fecha_vencimiento, estado, periodo) VALUES
-- Cuotas pagas (Enero 2025)
(1, 15000.00, '2025-01-10', 'Pagada', '2025-01'),
(2, 15000.00, '2025-01-10', 'Pagada', '2025-01'),
(3, 12000.00, '2025-01-10', 'Pagada', '2025-01'),
(4, 12000.00, '2025-01-10', 'Pagada', '2025-01'),
(5, 10000.00, '2025-01-10', 'Pagada', '2025-01'),

-- Cuotas pendientes (Febrero 2025)
(1, 15000.00, '2025-02-10', 'Pendiente', '2025-02'),
(2, 15000.00, '2025-02-10', 'Pendiente', '2025-02'),
(3, 12000.00, '2025-02-10', 'Pendiente', '2025-02'),
(4, 12000.00, '2025-02-10', 'Pendiente', '2025-02'),
(5, 10000.00, '2025-02-10', 'Pendiente', '2025-02'),
(6, 10000.00, '2025-02-10', 'Pendiente', '2025-02'),
(7, 8000.00, '2025-02-10', 'Pendiente', '2025-02'),
(8, 8000.00, '2025-02-10', 'Pendiente', '2025-02'),
(9, 5000.00, '2025-02-10', 'Pendiente', '2025-02'),
(10, 15000.00, '2025-02-10', 'Pendiente', '2025-02'),

-- Algunas cuotas vencidas (Enero)
(11, 12000.00, '2025-01-10', 'Vencida', '2025-01'),
(13, 8000.00, '2025-01-10', 'Vencida', '2025-01'),
(14, 5000.00, '2025-01-10', 'Vencida', '2025-01');

-- Actualizar fechas de pago para las cuotas pagadas
UPDATE cuotas SET 
    fecha_pago = '2025-01-08',
    metodo_pago = 'Transferencia',
    numero_recibo = CONCAT('REC-2025-', LPAD(id::text, 4, '0'))
WHERE estado = 'Pagada';

-- Comentarios informativos
COMMENT ON TABLE socios IS 'Tabla principal de socios y jugadores del Club Comandante Espora';
COMMENT ON TABLE cuotas IS 'Tabla de cuotas mensuales de los socios';
COMMENT ON COLUMN socios.actividad IS 'Actividad principal: Basquet, Voley, Karate, Gimnasio, o Socio';
COMMENT ON COLUMN socios.es_jugador IS 'Indica si es jugador activo (true) o solo socio (false)';
COMMENT ON COLUMN cuotas.periodo IS 'Período de la cuota en formato YYYY-MM';
COMMENT ON COLUMN cuotas.link_pago IS 'Link de pago de MercadoPago si aplica';