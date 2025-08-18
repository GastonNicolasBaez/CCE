const { sequelize, Socio, Cuota } = require('../models');
const config = require('../config');

// Sample data for initial database population
const sampleSocios = [
  // Basketball players
  {
    nombre: 'Juan Carlos',
    apellido: 'Pérez López',
    dni: '12345678',
    fechaNacimiento: '1995-03-15',
    telefono: '+54 11 1234-5678',
    email: 'juan.perez@email.com',
    actividad: 'Basquet',
    esJugador: true
  },
  {
    nombre: 'María Fernanda',
    apellido: 'González Silva',
    dni: '23456789',
    fechaNacimiento: '1998-07-22',
    telefono: '+54 11 2345-6789',
    email: 'maria.gonzalez@email.com',
    actividad: 'Basquet',
    esJugador: true
  },
  {
    nombre: 'Carlos Alberto',
    apellido: 'Rodríguez Martín',
    dni: '34567890',
    fechaNacimiento: '1992-11-08',
    telefono: '+54 11 3456-7890',
    email: 'carlos.rodriguez@email.com',
    actividad: 'Basquet',
    esJugador: true
  },
  {
    nombre: 'Ana Lucía',
    apellido: 'López Fernández',
    dni: '45678901',
    fechaNacimiento: '1994-05-18',
    telefono: '+54 11 4567-8901',
    email: 'ana.lopez@email.com',
    actividad: 'Basquet',
    esJugador: true
  },

  // Volleyball players
  {
    nombre: 'Roberto Daniel',
    apellido: 'Fernández Castro',
    dni: '56789012',
    fechaNacimiento: '1991-09-12',
    telefono: '+54 11 5678-9012',
    email: 'roberto.fernandez@email.com',
    actividad: 'Voley',
    esJugador: true
  },
  {
    nombre: 'Carmen Rosa',
    apellido: 'Ruiz Morales',
    dni: '67890123',
    fechaNacimiento: '1996-12-03',
    telefono: '+54 11 6789-0123',
    email: 'carmen.ruiz@email.com',
    actividad: 'Voley',
    esJugador: true
  },
  {
    nombre: 'Miguel Ángel',
    apellido: 'Torres Vega',
    dni: '78901234',
    fechaNacimiento: '1993-04-25',
    telefono: '+54 11 7890-1234',
    email: 'miguel.torres@email.com',
    actividad: 'Voley',
    esJugador: true
  },

  // Karate students
  {
    nombre: 'Alejandro José',
    apellido: 'Mendoza Herrera',
    dni: '89012345',
    fechaNacimiento: '1990-08-14',
    telefono: '+54 11 8901-2345',
    email: 'alejandro.mendoza@email.com',
    actividad: 'Karate',
    esJugador: true
  },
  {
    nombre: 'Lucía Esperanza',
    apellido: 'Navarro Sánchez',
    dni: '90123456',
    fechaNacimiento: '1997-01-30',
    telefono: '+54 11 9012-3456',
    email: 'lucia.navarro@email.com',
    actividad: 'Karate',
    esJugador: true
  },
  {
    nombre: 'Fernando Luis',
    apellido: 'Ríos Delgado',
    dni: '12309876',
    fechaNacimiento: '1988-06-17',
    telefono: '+54 11 0123-4567',
    email: 'fernando.rios@email.com',
    actividad: 'Karate',
    esJugador: true
  },

  // Gym members
  {
    nombre: 'Patricia Elena',
    apellido: 'Acosta Ramírez',
    dni: '23408765',
    fechaNacimiento: '1985-10-09',
    telefono: '+54 11 1234-5670',
    email: 'patricia.acosta@email.com',
    actividad: 'Gimnasio',
    esJugador: false
  },
  {
    nombre: 'Eduardo Martín',
    apellido: 'Miranda Torres',
    dni: '34507654',
    fechaNacimiento: '1987-02-28',
    telefono: '+54 11 2345-6701',
    email: 'eduardo.miranda@email.com',
    actividad: 'Gimnasio',
    esJugador: false
  },

  // Club members (socios)
  {
    nombre: 'Roberto Carlos',
    apellido: 'Díaz Méndez',
    dni: '45606543',
    fechaNacimiento: '1975-12-05',
    telefono: '+54 11 3456-7012',
    email: 'roberto.diaz@email.com',
    actividad: 'Socio',
    esJugador: false
  },
  {
    nombre: 'María Elena',
    apellido: 'Vargas Jiménez',
    dni: '56705432',
    fechaNacimiento: '1982-04-13',
    telefono: '+54 11 4567-8023',
    email: 'maria.vargas@email.com',
    actividad: 'Socio',
    esJugador: false
  },
  {
    nombre: 'Ana Sofía',
    apellido: 'Rojas Castillo',
    dni: '67804321',
    fechaNacimiento: '1979-09-21',
    telefono: '+54 11 5678-9034',
    email: 'ana.rojas@email.com',
    actividad: 'Socio',
    esJugador: false
  }
];

// Function to generate sample cuotas for existing socios
async function generateSampleCuotas() {
  const socios = await Socio.findAll();
  const cuotas = [];
  
  // Amount by activity
  const montosPorActividad = {
    'Basquet': 15000,
    'Voley': 12000,
    'Karate': 18000,
    'Gimnasio': 20000,
    'Socio': 8000
  };

  // Generate cuotas for last 6 months
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const periodo = date.toISOString().slice(0, 7); // YYYY-MM format
    const vencimiento = new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split('T')[0];
    
    for (const socio of socios) {
      const monto = montosPorActividad[socio.actividad] || montosPorActividad['Socio'];
      
      // Simulate different payment statuses
      let estado = 'Pendiente';
      let fechaPago = null;
      let metodoPago = null;
      
      const random = Math.random();
      if (i > 2) { // Older months are more likely to be paid
        if (random < 0.85) {
          estado = 'Pagada';
          fechaPago = new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1)
            .toISOString().split('T')[0];
          const metodos = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];
          metodoPago = metodos[Math.floor(Math.random() * metodos.length)];
        } else if (random < 0.95) {
          estado = 'Vencida';
        }
      } else if (i > 1) { // Recent months
        if (random < 0.7) {
          estado = 'Pagada';
          fechaPago = new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1)
            .toISOString().split('T')[0];
          const metodos = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];
          metodoPago = metodos[Math.floor(Math.random() * metodos.length)];
        } else if (random < 0.85) {
          estado = 'Vencida';
        }
      } else { // Current and last month
        if (random < 0.5) {
          estado = 'Pagada';
          fechaPago = new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1)
            .toISOString().split('T')[0];
          const metodos = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];
          metodoPago = metodos[Math.floor(Math.random() * metodos.length)];
        } else if (random < 0.75 && new Date(vencimiento) < new Date()) {
          estado = 'Vencida';
        }
      }
      
      cuotas.push({
        socioId: socio.id,
        monto: monto,
        fechaVencimiento: vencimiento,
        fechaPago: fechaPago,
        estado: estado,
        metodoPago: metodoPago,
        periodo: periodo,
        numeroRecibo: estado === 'Pagada' ? `CCE-${periodo.replace('-', '')}-${socio.id}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` : null
      });
    }
  }
  
  return cuotas;
}

// Main initialization function
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database (create tables)
    await sequelize.sync({ force: false }); // Use force: true to recreate tables
    console.log('✅ Database tables synchronized');
    
    // Check if data already exists
    const existingSociosCount = await Socio.count();
    
    if (existingSociosCount > 0) {
      console.log(`ℹ️ Database already contains ${existingSociosCount} socios`);
      
      const answer = process.argv.includes('--force') ? 'yes' : 'no';
      if (answer !== 'yes') {
        console.log('💡 Use --force flag to recreate sample data');
        console.log('✅ Database initialization completed');
        return;
      }
      
      // Clear existing data if force flag is used
      await Cuota.destroy({ where: {} });
      await Socio.destroy({ where: {} });
      console.log('🗑️ Existing data cleared');
    }
    
    // Create sample socios
    console.log('👥 Creating sample socios...');
    const createdSocios = await Socio.bulkCreate(sampleSocios);
    console.log(`✅ Created ${createdSocios.length} sample socios`);
    
    // Generate sample cuotas
    console.log('💰 Generating sample cuotas...');
    const sampleCuotas = await generateSampleCuotas();
    const createdCuotas = await Cuota.bulkCreate(sampleCuotas);
    console.log(`✅ Created ${createdCuotas.length} sample cuotas`);
    
    // Display statistics
    const stats = await generateStatistics();
    console.log('\n📊 Database Statistics:');
    console.log(`  • Total Socios: ${stats.totalSocios}`);
    console.log(`  • Active Socios: ${stats.activeSocios}`);
    console.log(`  • Total Cuotas: ${stats.totalCuotas}`);
    console.log(`  • Paid Cuotas: ${stats.paidCuotas}`);
    console.log(`  • Pending Cuotas: ${stats.pendingCuotas}`);
    console.log(`  • Overdue Cuotas: ${stats.overdueCuotas}`);
    
    console.log('\n✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Generate database statistics
async function generateStatistics() {
  const totalSocios = await Socio.count();
  const activeSocios = await Socio.count({ where: { estado: 'Activo' } });
  const totalCuotas = await Cuota.count();
  const paidCuotas = await Cuota.count({ where: { estado: 'Pagada' } });
  const pendingCuotas = await Cuota.count({ where: { estado: 'Pendiente' } });
  const overdueCuotas = await Cuota.count({ where: { estado: 'Vencida' } });
  
  return {
    totalSocios,
    activeSocios,
    totalCuotas,
    paidCuotas,
    pendingCuotas,
    overdueCuotas
  };
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase,
  generateStatistics,
  sampleSocios
};