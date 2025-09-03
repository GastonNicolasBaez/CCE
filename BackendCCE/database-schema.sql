-- Eliminar tablas si existen (para recrear)
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
CREATE INDEX idx_cuotas_socio_id ON cuotas(socio_id);
CREATE INDEX idx_cuotas_estado ON cuotas(estado);
CREATE INDEX idx_cuotas_periodo ON cuotas(periodo);
CREATE INDEX idx_cuotas_fecha_vencimiento ON cuotas(fecha_vencimiento);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_socios_updated_at BEFORE UPDATE ON socios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cuotas_updated_at BEFORE UPDATE ON cuotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcional)
INSERT INTO socios (nombre, apellido, dni, fecha_nacimiento, telefono, email, actividad, es_jugador) VALUES
('Juan Carlos', 'Pérez López', '12345678', '1995-03-15', '+54 11 1234-5678', 'juan.perez@email.com', 'Basquet', true),
('María Fernanda', 'González Silva', '23456789', '1998-07-22', '+54 11 2345-6789', 'maria.gonzalez@email.com', 'Basquet', true),
('Carlos Alberto', 'Rodríguez Martín', '34567890', '1992-11-08', '+54 11 3456-7890', 'carlos.rodriguez@email.com', 'Voley', true);