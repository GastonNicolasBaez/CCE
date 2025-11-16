const { sequelize, Socio, Cuota, Usuario } = require('../models');
const config = require('../config');
const bcrypt = require('bcryptjs');

// Sample users for testing
const sampleUsuarios = [
  {
    nombre: 'Admin',
    apellido: 'Principal',
    email: 'admin@cce.com',
    password: 'admin123', // Will be hashed
    rol: 'admin',
    activo: true
  },
  {
    nombre: 'Staff',
    apellido: 'Miembro',
    email: 'staff@cce.com',
    password: 'staff123', // Will be hashed
    rol: 'staff',
    activo: true
  },
  {
    nombre: 'Juan',
    apellido: 'Administrador',
    email: 'juan.admin@cce.com',
    password: 'admin123',
    rol: 'admin',
    activo: true
  },
  {
    nombre: 'María',
    apellido: 'Staff',
    email: 'maria.staff@cce.com',
    password: 'staff123',
    rol: 'staff',
    activo: true
  },
  {
    nombre: 'Pedro',
    apellido: 'Inactivo',
    email: 'pedro.inactivo@cce.com',
    password: 'test123',
    rol: 'staff',
    activo: false
  }
];

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
    actividad: 'Solo socio',
    esJugador: false
  },
  {
    nombre: 'María Elena',
    apellido: 'Vargas Jiménez',
    dni: '56705432',
    fechaNacimiento: '1982-04-13',
    telefono: '+54 11 4567-8023',
    email: 'maria.vargas@email.com',
    actividad: 'Solo socio',
    esJugador: false
  },
  {
    nombre: 'Ana Sofía',
    apellido: 'Rojas Castillo',
    dni: '67804321',
    fechaNacimiento: '1979-09-21',
    telefono: '+54 11 5678-9034',
    email: 'ana.rojas@email.com',
    actividad: 'Solo socio',
    esJugador: false
  },

  // Inactive members (for testing different states)
  {
    nombre: 'Diego',
    apellido: 'Inactivo Prueba',
    dni: '78903210',
    fechaNacimiento: '1990-03-10',
    telefono: '+54 11 6789-0345',
    email: 'diego.inactivo@email.com',
    actividad: 'Basquet',
    esJugador: true,
    estado: 'Inactivo'
  },
  {
    nombre: 'Laura',
    apellido: 'Suspendida Test',
    dni: '89012109',
    fechaNacimiento: '1993-07-20',
    telefono: '+54 11 7890-1456',
    email: 'laura.suspendida@email.com',
    actividad: 'Gimnasio',
    esJugador: false,
    estado: 'Suspendido'
  },
  {
    nombre: 'Martín',
    apellido: 'Inactivo Gimnasio',
    dni: '90121098',
    fechaNacimiento: '1988-11-05',
    telefono: '+54 11 8901-2567',
    email: 'martin.inactivo@email.com',
    actividad: 'Gimnasio',
    esJugador: false,
    estado: 'Inactivo'
  }
];

// Function to create sample users with hashed passwords
async function createSampleUsers() {
  console.log('👤 Creating sample users...');
  const usersToCreate = [];

  for (const userData of sampleUsuarios) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    usersToCreate.push({
      ...userData,
      password: hashedPassword
    });
  }

  const createdUsers = await Usuario.bulkCreate(usersToCreate);
  console.log(`✅ Created ${createdUsers.length} sample users`);

  // Display user credentials for testing
  console.log('\n🔑 Test User Credentials:');
  console.log('─'.repeat(60));
  sampleUsuarios.forEach(user => {
    console.log(`  ${user.rol.toUpperCase().padEnd(8)} | ${user.email.padEnd(30)} | ${user.password}`);
  });
  console.log('─'.repeat(60));

  return createdUsers;
}

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
    'Solo socio': 8000
  };

  // Generate cuotas for last 6 months
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const periodo = date.toISOString().slice(0, 7); // YYYY-MM format
    const vencimiento = new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split('T')[0];
    
    for (const socio of socios) {
      const monto = montosPorActividad[socio.actividad] || montosPorActividad['Solo socio'];
      
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
    console.log('🔧 Initializing database for testing environment...');
    console.log('═'.repeat(60));

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database (create tables)
    const force = process.argv.includes('--force');
    await sequelize.sync({ force }); // Recreate tables if --force flag is used
    console.log('✅ Database tables synchronized');

    // Check if data already exists
    const existingUsersCount = await Usuario.count();
    const existingSociosCount = await Socio.count();

    if (existingUsersCount > 0 || existingSociosCount > 0) {
      console.log(`ℹ️ Database contains: ${existingUsersCount} users, ${existingSociosCount} socios`);

      if (!force) {
        console.log('💡 Use --force flag to recreate all sample data');
        console.log('✅ Database initialization completed (no changes)');
        return;
      }

      // Clear existing data if force flag is used
      console.log('🗑️ Clearing existing data...');
      await Cuota.destroy({ where: {}, force: true });
      await Socio.destroy({ where: {}, force: true });
      await Usuario.destroy({ where: {}, force: true });
      console.log('✅ Existing data cleared');
    }

    console.log('\n📝 Creating test data...');
    console.log('─'.repeat(60));

    // Create sample users (system users for login)
    await createSampleUsers();

    // Create sample socios (club members)
    console.log('\n👥 Creating sample socios...');
    const createdSocios = await Socio.bulkCreate(sampleSocios);
    console.log(`✅ Created ${createdSocios.length} sample socios`);

    // Generate sample cuotas (payments)
    console.log('\n💰 Generating sample cuotas...');
    const sampleCuotas = await generateSampleCuotas();
    const createdCuotas = await Cuota.bulkCreate(sampleCuotas);
    console.log(`✅ Created ${createdCuotas.length} sample cuotas`);

    // Display statistics
    const stats = await generateStatistics();
    console.log('\n📊 Database Statistics:');
    console.log('═'.repeat(60));
    console.log(`  👥 Total Socios: ${stats.totalSocios}`);
    console.log(`     ├─ Active: ${stats.activeSocios}`);
    console.log(`     ├─ Inactive: ${stats.inactiveSocios}`);
    console.log(`     └─ Suspended: ${stats.suspendedSocios}`);
    console.log(`\n  💰 Total Cuotas: ${stats.totalCuotas}`);
    console.log(`     ├─ Paid: ${stats.paidCuotas}`);
    console.log(`     ├─ Pending: ${stats.pendingCuotas}`);
    console.log(`     └─ Overdue: ${stats.overdueCuotas}`);
    console.log(`\n  👤 Total Users: ${stats.totalUsers}`);
    console.log(`     ├─ Admins: ${stats.adminUsers}`);
    console.log(`     ├─ Staff: ${stats.staffUsers}`);
    console.log(`     └─ Active: ${stats.activeUsers}`);
    console.log('═'.repeat(60));

    console.log('\n🎉 Test database initialized successfully!');
    console.log('');
    console.log('📋 Quick Start:');
    console.log('  1. Start backend: cd BackendCCE && npm run dev');
    console.log('  2. Start frontend: cd FrontendCCE && npm run dev');
    console.log('  3. Login with: admin@cce.com / admin123');
    console.log('');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Generate database statistics
async function generateStatistics() {
  const totalSocios = await Socio.count();
  const activeSocios = await Socio.count({ where: { estado: 'Activo' } });
  const inactiveSocios = await Socio.count({ where: { estado: 'Inactivo' } });
  const suspendedSocios = await Socio.count({ where: { estado: 'Suspendido' } });

  const totalCuotas = await Cuota.count();
  const paidCuotas = await Cuota.count({ where: { estado: 'Pagada' } });
  const pendingCuotas = await Cuota.count({ where: { estado: 'Pendiente' } });
  const overdueCuotas = await Cuota.count({ where: { estado: 'Vencida' } });

  const totalUsers = await Usuario.count();
  const adminUsers = await Usuario.count({ where: { rol: 'admin' } });
  const staffUsers = await Usuario.count({ where: { rol: 'staff' } });
  const activeUsers = await Usuario.count({ where: { activo: true } });

  return {
    totalSocios,
    activeSocios,
    inactiveSocios,
    suspendedSocios,
    totalCuotas,
    paidCuotas,
    pendingCuotas,
    overdueCuotas,
    totalUsers,
    adminUsers,
    staffUsers,
    activeUsers
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