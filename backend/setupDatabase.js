import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

// Datos iniciales que vamos a insertar
const professionalsData = [
  {
    id: 101,
    name: 'Alejandro Vento',
    specialty: 'Arquitecto',
    rating: 4.9,
    reviews: 128,
    verified: true,
    bio: 'Arquitecto especializado en diseño residencial de alta gama y remodelaciones sostenibles. Con más de 12 años de trayectoria, mi enfoque se centra en fusionar la funcionalidad moderna con la estética atemporal. Comprometido con la excelencia y un servicio premium personalizado para cada proyecto.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxvUAl_s2nd2pHV27uJP0z-n0OsKs0XffewW1u5Nu4jMQFN7vL1Vz4ukSLGTEjR45bRFyWKCNmMxbVcNHHworu6rlCwlT5cJ-Rvi6KZx3pI45kHa3_g6e0fT-5KBsQMN2eFf5hdNnsDKBvN5dgHi5CbLvbM7FT-ZcsG76_PnjRRDzGDDoTlwel9JZ8O4lueN7kb6YRyuqw8zXoH_nKlX5bAppc8E5BAUBzi31W4z6Dw7s-U3nAAQE7qbxsRW8_gaGI9IU-tAkKvwx9',
  },
  {
    id: 102,
    name: 'Elena Rodríguez',
    specialty: 'Grifería y Fontanería',
    rating: 3.7,
    reviews: 94,
    verified: false,
    bio: 'Especialista en instalaciones y reparaciones de fontanería, con un enfoque en soluciones eficientes y duraderas. Mi objetivo es garantizar la satisfacción del cliente a través de un trabajo limpio, rápido y profesional.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNY5BEa4escux4SFfnsHYAPpCmQPUdXd2cIfeKm8rblZ6XzWRgg655_pA1cR9uGVMvTNtXeLpnpli4T3cltq41pg3foXVD_L75P2iP99DOIIPglqA5KiNZCox_wFDzYHLfAslshaFsT56fGfzU0WRLPvtaCrJudTyZBydJK8SqNLMwnQlUqwAATIlsw4QG5TPGcb2wZrBen_bLs508b3RpTPxcI0HGaDKTPkHD_7boHNLsovbvx0pjYpHARC3lM-0lXIba8jUc_qYB',
  },
  {
    id: 103,
    name: 'Carlos Soliz',
    specialty: 'Pintor',
    rating: 4.8,
    reviews: 76,
    verified: true,
    bio: 'Pintor profesional con experiencia en interiores y exteriores. Me especializo en acabados de alta calidad y técnicas decorativas. La limpieza y el detalle son mi prioridad.',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop',
  },
  {
    id: 104,
    name: 'Lucía Méndez',
    specialty: 'Jardinería',
    rating: 4.9,
    reviews: 55,
    verified: false,
    bio: 'Apasionada por el diseño de paisajes y el mantenimiento de jardines. Ofrezco servicios de poda, siembra, control de plagas y diseño de espacios verdes para hogares y empresas.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop',
  },
  {
    id: 105,
    name: 'Andrés Roca',
    specialty: 'Arquitecto',
    rating: 4.7,
    reviews: 89,
    verified: true,
    bio: 'Arquitecto enfocado en proyectos comerciales y de oficina. Mi trabajo busca optimizar el espacio y la luz para crear ambientes productivos y modernos.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop',
  },
];

const servicesData = [
  // --- TRABAJOS DE CONSTRUCCIÓN ---
  { id: 1, name: 'Albañil / Maestro de Obra', icon_name: 'construction', category: 'Construcción', is_main: true, is_high_risk: false },
  { id: 2, name: 'Encofrador / Carpintero de Obra', icon_name: 'carpenter', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 3, name: 'Fierrero / Armador de Hierro', icon_name: 'hardware', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 4, name: 'Peón / Ayudante de Construcción', icon_name: 'handyman', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 5, name: 'Montador de Andamios', icon_name: 'reorder', category: 'Construcción', is_main: false, is_high_risk: true },
  { id: 6, name: 'Electricista (Alta / Media Tensión)', icon_name: 'bolt', category: 'Construcción', is_main: false, is_high_risk: true },
  { id: 7, name: 'Plomero / Fontanero Industrial', icon_name: 'plumbing', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 8, name: 'Gasista Matriculado', icon_name: 'propane', category: 'Construcción', is_main: false, is_high_risk: true },
  { id: 9, name: 'Técnico en Climatización (HVAC)', icon_name: 'ac_unit', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 10, name: 'Soldador Industrial / Estructural', icon_name: 'precision_manufacturing', category: 'Construcción', is_main: false, is_high_risk: true },
  { id: 11, name: 'Instalador de Drywall / Yesero', icon_name: 'layers', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 12, name: 'Colocador de Pisos / Porcelanatero', icon_name: 'grid_on', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 13, name: 'Pintor de Obra / Fachadista', icon_name: 'format_paint', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 14, name: 'Carpintero de Terminaciones', icon_name: 'carpenter', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 15, name: 'Cristalero / Ventanero', icon_name: 'window', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 16, name: 'Operador de Maquinaria Pesada', icon_name: 'engineering', category: 'Construcción', is_main: false, is_high_risk: true },
  { id: 17, name: 'Chofer de Camión / Volqueta', icon_name: 'local_shipping', category: 'Construcción', is_main: false, is_high_risk: true },
  { id: 18, name: 'Topógrafo', icon_name: 'map', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 19, name: 'Capataz / Supervisor de Obra', icon_name: 'supervisor_account', category: 'Construcción', is_main: false, is_high_risk: false },
  { id: 20, name: 'Técnico en Seguridad e Higiene (HSE)', icon_name: 'security', category: 'Construcción', is_main: false, is_high_risk: false },

  // --- TRABAJOS DE HOGAR ---
  { id: 21, name: 'Electricista (Baja Tensión / Residencial)', icon_name: 'electrical_services', category: 'Hogar', is_main: true, is_high_risk: false },
  { id: 22, name: 'Plomero / Fontanero', icon_name: 'plumbing', category: 'Hogar', is_main: true, is_high_risk: false },
  { id: 23, name: 'Gasista Domiciliario', icon_name: 'propane', category: 'Hogar', is_main: false, is_high_risk: true },
  { id: 24, name: 'Técnico en Climatización / Aire Acondicionado', icon_name: 'ac_unit', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 25, name: 'Instalador de Cerrajería / Cerrajero', icon_name: 'lock_open', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 26, name: 'Limpieza de Casas / Hogar', icon_name: 'cleaning_services', category: 'Hogar', is_main: true, is_high_risk: false },
  { id: 27, name: 'Limpieza de Tapizados y Alfombras', icon_name: 'dry_cleaning', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 28, name: 'Limpieza Post-Obra', icon_name: 'cleaning_services', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 29, name: 'Fumigador / Control de Plagas', icon_name: 'pest_control', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 30, name: 'Lavandería y Planchado', icon_name: 'local_laundry_service', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 31, name: 'Jardinero', icon_name: 'yard', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 32, name: 'Podador de Árboles / Podador de Altura', icon_name: 'nature', category: 'Hogar', is_main: false, is_high_risk: true },
  { id: 33, name: 'Mantenimiento de Piscinas / Piletero', icon_name: 'pool', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 34, name: 'Paisajista', icon_name: 'forest', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 35, name: 'Pintor Domiciliario', icon_name: 'format_paint', category: 'Hogar', is_main: true, is_high_risk: false },
  { id: 36, name: 'Handyman / "Mil Oficios"', icon_name: 'build', category: 'Hogar', is_main: true, is_high_risk: false },
  { id: 37, name: 'Carpintero / Ebanista', icon_name: 'carpenter', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 38, name: 'Taponero / Tapicero', icon_name: 'chair', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 39, name: 'Vidriero / Cristalero', icon_name: 'window', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 40, name: 'Herrero Domiciliario', icon_name: 'hardware', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 41, name: 'Flete y Mudanzas', icon_name: 'local_shipping', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 42, name: 'Cargador / Ayudante de Mudanzas', icon_name: 'rv_hookup', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 43, name: 'Técnico de Electrodomésticos', icon_name: 'kitchen', category: 'Hogar', is_main: false, is_high_risk: false },
  { id: 44, name: 'Instalador de Redes de Seguridad', icon_name: 'grid_view', category: 'Hogar', is_main: false, is_high_risk: false },

  // --- TRABAJOS DE SEGURIDAD ---
  { id: 45, name: 'Guardia de Seguridad / Vigilante', icon_name: 'security', category: 'Seguridad', is_main: true, is_high_risk: true },
  { id: 46, name: 'Conserje / Portero', icon_name: 'door_sliding', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 47, name: 'Escolta / Proteccion Personal', icon_name: 'shield', category: 'Seguridad', is_main: false, is_high_risk: true },
  { id: 48, name: 'Seguridad para Eventos', icon_name: 'groups', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 49, name: 'Controlador de Accesos / Recepcionista de Seguridad', icon_name: 'badge', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 50, name: 'Instalador de Cámaras (CCTV)', icon_name: 'videocam', category: 'Seguridad', is_main: true, is_high_risk: false },
  { id: 51, name: 'Técnico de Alarmas y Sensores', icon_name: 'ring_volume', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 52, name: 'Técnico de Cerco Eléctrico', icon_name: 'bolt', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 53, name: 'Instalador de Control de Acceso', icon_name: 'fingerprint', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 54, name: 'Técnico de Automotización de Portones', icon_name: 'sensor_door', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 55, name: 'Técnico en Extintores y Protección Contra Incendios', icon_name: 'fire_extinguisher', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 56, name: 'Consultor / Asesor en Seguridad', icon_name: 'admin_panel_settings', category: 'Seguridad', is_main: false, is_high_risk: false },
  { id: 57, name: 'Técnico en Ciberseguridad / Redes Seguras', icon_name: 'vpn_lock', category: 'Seguridad', is_main: false, is_high_risk: false },

  // --- TRABAJOS DE TECNOLOGÍA ---
  { id: 58, name: 'Técnico de Computadoras / Laptops', icon_name: 'computer', category: 'Tecnología', is_main: true, is_high_risk: false },
  { id: 59, name: 'Técnico de Celulares y Tablets', icon_name: 'smartphone', category: 'Tecnología', is_main: true, is_high_risk: false },
  { id: 60, name: 'Técnico de Impresoras y Periféricos', icon_name: 'print', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 61, name: 'Técnico de Consolas de Videojuegos', icon_name: 'sports_esports', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 62, name: 'Técnico de Televisores y Audio', icon_name: 'tv', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 63, name: 'Técnico de Redes y Wi-Fi', icon_name: 'router', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 64, name: 'Instalador de Domótica / Casa Inteligente', icon_name: 'smart_toy', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 65, name: 'Técnico de Antenas y TV por Cable/Satelital', icon_name: 'settings_input_antenna', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 66, name: 'Especialista en Software / Formateo', icon_name: 'terminal', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 67, name: 'Soporte Técnico IT (Empresarial)', icon_name: 'support_agent', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 68, name: 'Desarrollador Web', icon_name: 'code', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 69, name: 'Diseñador Gráfico / UI', icon_name: 'palette', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 70, name: 'Community Manager / Marketing Digital', icon_name: 'campaign', category: 'Tecnología', is_main: false, is_high_risk: false },
  { id: 71, name: 'Editor de Video y Audio', icon_name: 'video_camera_back', category: 'Tecnología', is_main: false, is_high_risk: false },

  { id: 72, name: 'Otro', icon_name: 'category', category: 'Varios', is_main: false, is_high_risk: false }
];

async function setup() {
  // Abrimos la base de datos (o la creamos si no existe)
  const db = await open({
    filename: './senn.db',
    driver: sqlite3.Database
  });

  // Creamos la tabla de profesionales
  await db.exec(`
    CREATE TABLE IF NOT EXISTS professionals (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT,
      rating REAL,
      reviews INTEGER,
      verified BOOLEAN,
      bio TEXT,
      imageUrl TEXT,
      services_offered TEXT,
      has_store BOOLEAN DEFAULT 0,
      store_address TEXT,
      latitude REAL,
      longitude REAL,
      action_radius REAL DEFAULT 10,
      is_online BOOLEAN DEFAULT 0,
      current_latitude REAL,
      current_longitude REAL
    );
  `);

  // Insertamos los datos usando un bucle
  const stmt = await db.prepare('INSERT OR IGNORE INTO professionals (id, name, specialty, rating, reviews, verified, bio, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const prof of professionalsData) {
    await stmt.run(prof.id, prof.name, prof.specialty, prof.rating, prof.reviews, prof.verified, prof.bio, prof.imageUrl);
  }
  await stmt.finalize();

  // Creamos la tabla de servicios
  await db.exec(`
    DROP TABLE IF EXISTS services;
    CREATE TABLE services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon_name TEXT,
      category TEXT,
      is_main BOOLEAN DEFAULT 0,
      is_high_risk BOOLEAN DEFAULT 0
    )
  `);

  // Insertamos los datos de los servicios
  const serviceStmt = await db.prepare('INSERT OR IGNORE INTO services (id, name, icon_name, category, is_main, is_high_risk) VALUES (?, ?, ?, ?, ?, ?)');
  for (const service of servicesData) {
    await serviceStmt.run(service.id, service.name, service.icon_name, service.category, service.is_main ? 1 : 0, service.is_high_risk ? 1 : 0);
  }
  await serviceStmt.finalize();

  // Creamos la tabla de usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE,
      birth_date TEXT NOT NULL,
      identity_card TEXT UNIQUE,
      imageUrl TEXT,
      user_type TEXT NOT NULL DEFAULT 'client' CHECK(user_type IN ('client', 'professional')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'suspended')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // --- Datos y tabla de usuarios para los profesionales ---
  // En una app real, esto sería un solo flujo de registro.
  // Por ahora, creamos usuarios para que puedan chatear.
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds); // Contraseña simple para todos los ejemplos

  const professionalUsers = [
    // Es importante que el ID aquí coincida con el ID de professionalsData
    { id: 101, name: 'Alejandro Vento', email: 'alejandro@senn.com', password_hash: passwordHash, user_type: 'professional', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxvUAl_s2nd2pHV27uJP0z-n0OsKs0XffewW1u5Nu4jMQFN7vL1Vz4ukSLGTEjR45bRFyWKCNmMxbVcNHHworu6rlCwlT5cJ-Rvi6KZx3pI45kHa3_g6e0fT-5KBsQMN2eFf5hdNnsDKBvN5dgHi5CbLvbM7FT-ZcsG76_PnjRRDzGDDoTlwel9JZ8O4lueN7kb6YRyuqw8zXoH_nKlX5bAppc8E5BAUBzi31W4z6Dw7s-U3nAAQE7qbxsRW8_gaGI9IU-tAkKvwx9', phone_number: '77711101', birth_date: '1985-05-20', identity_card: '1234501', status: 'active' },
    { id: 102, name: 'Elena Rodríguez', email: 'elena@senn.com', password_hash: passwordHash, user_type: 'professional', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNY5BEa4escux4SFfnsHYAPpCmQPUdXd2cIfeKm8rblZ6XzWRgg655_pA1cR9uGVMvTNtXeLpnpli4T3cltq41pg3foXVD_L75P2iP99DOIIPglqA5KiNZCox_wFDzYHLfAslshaFsT56fGfzU0WRLPvtaCrJudTyZBydJK8SqNLMwnQlUqwAATIlsw4QG5TPGcb2wZrBen_bLs508b3RpTPxcI0HGaDKTPkHD_7boHNLsovbvx0pjYpHARC3lM-0lXIba8jUc_qYB', phone_number: '77711102', birth_date: '1992-11-30', identity_card: '1234502', status: 'active' },
    { id: 103, name: 'Carlos Soliz', email: 'carlos@senn.com', password_hash: passwordHash, user_type: 'professional', imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop', phone_number: '77711103', birth_date: '1988-01-15', identity_card: '1234503', status: 'active' },
    { id: 104, name: 'Lucía Méndez', email: 'lucia@senn.com', password_hash: passwordHash, user_type: 'professional', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop', phone_number: '77711104', birth_date: '1995-08-22', identity_card: '1234504', status: 'active' },
    { id: 105, name: 'Andrés Roca', email: 'andres@senn.com', password_hash: passwordHash, user_type: 'professional', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop', phone_number: '77711105', birth_date: '1980-03-10', identity_card: '1234505', status: 'active' },
  ];

  const userStmt = await db.prepare('INSERT OR IGNORE INTO users (id, name, email, password_hash, user_type, imageUrl, phone_number, birth_date, identity_card, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const user of professionalUsers) {
    await userStmt.run(user.id, user.name, user.email, user.password_hash, user.user_type, user.imageUrl, user.phone_number, user.birth_date, user.identity_card, user.status);
  }
  await userStmt.finalize();

  // --- Tablas para el Chat ---
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id),
      FOREIGN KEY (user2_id) REFERENCES users(id),
      UNIQUE(user1_id, user2_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );
  `);

  // --- Tabla para Reseñas ---
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      professional_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (professional_id) REFERENCES professionals(id),
      FOREIGN KEY (client_id) REFERENCES users(id)
    );
  `);

  // --- Tabla para Alertas de Seguridad Administrativa ---
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_type TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      details TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Base de datos configurada y poblada con éxito.');
  await db.close();
}

setup();