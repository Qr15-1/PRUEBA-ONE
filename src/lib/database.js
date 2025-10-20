// =================================================================
// CONFIGURACIÓN DE BASE DE DATOS SQLITE - VERSIÓN SIMPLIFICADA
// =================================================================

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// --- CÓDIGO MÁS SIMPLE Y ROBUSTO ---

// Ruta por defecto para desarrollo local
const defaultDbPath = path.join(process.cwd(), 'data', 'rojasfitt.db');

// Usar la variable de entorno de Render si existe, si no, usar la ruta por defecto
const dbPath = process.env.DATABASE_PATH || defaultDbPath;

console.log(`🔍 Variable DATABASE_PATH: ${process.env.DATABASE_PATH || 'No configurada'}`);
console.log(`🔍 Ruta de BD seleccionada: ${dbPath}`);

// Asegurarse de que el directorio donde vivirá la DB exista
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`✅ Carpeta de base de datos creada/verificada en: ${dbDir}`);
}

// Exportar la conexión a la base de datos
export const db = new Database(dbPath);

console.log(`✅ Base de datos SQLite inicializada en: ${dbPath}`);

// =================================================================
// CREAR TABLAS
// =================================================================

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    newsletter BOOLEAN DEFAULT 0,
    reset_token TEXT,
    reset_token_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

const createUserSessionsTable = `
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
`;

const createCoursesTable = `
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    category TEXT,
    duration INTEGER DEFAULT 0,
    level TEXT DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

const createCourseModulesTable = `
CREATE TABLE IF NOT EXISTS course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
)
`;

const createAdminUsersTable = `
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

const createAdminSessionsTable = `
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users (id) ON DELETE CASCADE
)
`;

const createProductsTable = `
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

const createOrdersTable = `
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
`;

const createOrderItemsTable = `
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
)
`;

// Ejecutar la creación de tablas
try {
    db.exec(createUsersTable);
    db.exec(createUserSessionsTable);
    db.exec(createCoursesTable);
    db.exec(createCourseModulesTable);
    db.exec(createAdminUsersTable);
    db.exec(createAdminSessionsTable);
    db.exec(createProductsTable);
    db.exec(createOrdersTable);
    db.exec(createOrderItemsTable);
    
    // Agregar columnas faltantes a la tabla courses si no existen
    try {
        db.exec(`ALTER TABLE courses ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL`);
        console.log('✅ Columna original_price agregada');
    } catch (e) {
        // La columna ya existe, ignorar error
    }
    
    try {
        db.exec(`ALTER TABLE courses ADD COLUMN students INTEGER DEFAULT 0`);
        console.log('✅ Columna students agregada');
    } catch (e) {
        // La columna ya existe, ignorar error
    }
    
    try {
        db.exec(`ALTER TABLE courses ADD COLUMN instructor TEXT DEFAULT 'Instructor'`);
        console.log('✅ Columna instructor agregada');
    } catch (e) {
        // La columna ya existe, ignorar error
    }
    
    console.log('✅ Todas las tablas creadas/verificadas correctamente');
} catch (error) {
    console.error('❌ Error creando tablas:', error);
}

// =================================================================
// QUERIES PARA USUARIOS
// =================================================================

export const userQueries = {
    create: (userData) => {
        const stmt = db.prepare(`
            INSERT INTO users (first_name, last_name, email, phone, password_hash, newsletter)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.phone || null,
            userData.passwordHash,
            userData.newsletter ? 1 : 0
        );
    },

    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },

    updateResetToken: (userId, resetToken, resetExpiry) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET reset_token = ?, reset_token_expiry = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(resetToken, resetExpiry, userId);
    },

    findByResetToken: (token) => {
        const stmt = db.prepare(`
            SELECT * FROM users 
            WHERE reset_token = ? AND reset_token_expiry > CURRENT_TIMESTAMP
        `);
        return stmt.get(token);
    },

    updatePassword: (userId, passwordHash) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(passwordHash, userId);
    },

    getAll: () => {
        const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
        return stmt.all();
    },

    update: (id, userData) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, phone = ?, newsletter = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.phone || null,
            userData.newsletter ? 1 : 0,
            id
        );
    },

    delete: (id) => {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }
};

// =================================================================
// QUERIES PARA SESIONES DE USUARIOS
// =================================================================

export const sessionQueries = {
    create: (userId, sessionToken, expiresAt) => {
        const stmt = db.prepare(`
            INSERT INTO user_sessions (user_id, session_token, expires_at)
            VALUES (?, ?, ?)
        `);
        return stmt.run(userId, sessionToken, expiresAt);
    },

    findByToken: (token) => {
        const stmt = db.prepare(`
            SELECT user_sessions.*, u.first_name, u.last_name, u.email 
            FROM user_sessions
            JOIN users u ON user_sessions.user_id = u.id
            WHERE user_sessions.session_token = ? AND user_sessions.expires_at > datetime('now')
        `);
        return stmt.get(token);
    },

    deleteByToken: (token) => {
        const stmt = db.prepare('DELETE FROM user_sessions WHERE session_token = ?');
        return stmt.run(token);
    },

    deleteExpired: () => {
        const stmt = db.prepare("DELETE FROM user_sessions WHERE expires_at <= datetime('now')");
        return stmt.run();
    }
};

// =================================================================
// QUERIES PARA AUTENTICACIÓN
// =================================================================

export const authQueries = {
    getUserByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },

    updateUserResetToken: (userId, resetToken, resetExpiry) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET reset_token = ?, reset_token_expiry = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(resetToken, resetExpiry, userId);
    },

    getUserByResetToken: (token) => {
        const stmt = db.prepare(`
            SELECT * FROM users 
            WHERE reset_token = ? AND reset_token_expiry > CURRENT_TIMESTAMP
        `);
        return stmt.get(token);
    },

    updateUserPassword: (userId, passwordHash) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(passwordHash, userId);
    }
};

// =================================================================
// QUERIES PARA CURSOS
// =================================================================

export const courseQueries = {
    create: (courseData) => {
        const stmt = db.prepare(`
            INSERT INTO courses (title, slug, description, image, price, category, duration, level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            courseData.title,
            courseData.slug,
            courseData.description,
            courseData.image,
            courseData.price,
            courseData.category,
            courseData.duration,
            courseData.level
        );
    },

    getAll: () => {
        const stmt = db.prepare('SELECT * FROM courses WHERE is_active = 1 ORDER BY created_at DESC');
        return stmt.all();
    },

    findBySlug: (slug) => {
        const stmt = db.prepare('SELECT * FROM courses WHERE slug = ? AND is_active = 1');
        return stmt.get(slug);
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
        return stmt.get(id);
    },

    update: (id, courseData) => {
        const stmt = db.prepare(`
            UPDATE courses 
            SET title = ?, slug = ?, description = ?, image = ?, price = ?, original_price = ?, category = ?, duration = ?, level = ?, students = ?, instructor = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            courseData.title,
            courseData.slug || courseData.title.toLowerCase().replace(/\s+/g, '-'),
            courseData.description,
            courseData.image,
            parseFloat(courseData.price),
            courseData.originalPrice ? parseFloat(courseData.originalPrice) : null,
            courseData.category,
            parseInt(courseData.duration),
            courseData.level,
            parseInt(courseData.students) || 0,
            courseData.instructor || 'Instructor',
            id
        );
    },

    delete: (id) => {
        const stmt = db.prepare('UPDATE courses SET is_active = 0 WHERE id = ?');
        return stmt.run(id);
    }
};

// =================================================================
// QUERIES PARA MÓDULOS DE CURSOS
// =================================================================

export const moduleQueries = {
    create: (moduleData) => {
        const stmt = db.prepare(`
            INSERT INTO course_modules (course_id, title, description, video_url, duration, order_index, is_free)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            moduleData.courseId,
            moduleData.title,
            moduleData.description,
            moduleData.videoUrl,
            moduleData.duration,
            moduleData.orderIndex || 0,
            moduleData.isFree ? 1 : 0
        );
    },

    getByCourse: (courseId) => {
        const stmt = db.prepare(`
            SELECT * FROM course_modules 
            WHERE course_id = ? 
            ORDER BY order_index ASC, created_at ASC
        `);
        return stmt.all(courseId);
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM course_modules WHERE id = ?');
        return stmt.get(id);
    },

    update: (id, moduleData) => {
        const stmt = db.prepare(`
            UPDATE course_modules 
            SET title = ?, description = ?, video_url = ?, duration = ?, order_index = ?, is_free = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            moduleData.title,
            moduleData.description,
            moduleData.videoUrl,
            moduleData.duration,
            moduleData.orderIndex,
            moduleData.isFree ? 1 : 0,
            id
        );
    },

    delete: (id) => {
        const stmt = db.prepare('DELETE FROM course_modules WHERE id = ?');
        return stmt.run(id);
    }
};

// =================================================================
// QUERIES PARA ADMINISTRADORES
// =================================================================

export const adminQueries = {
    create: (adminData) => {
        const stmt = db.prepare(`
            INSERT INTO admin_users (username, email, password_hash)
            VALUES (?, ?, ?)
        `);
        return stmt.run(adminData.username, adminData.email, adminData.passwordHash);
    },

    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ?');
        return stmt.get(email);
    },

    findByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?');
        return stmt.get(username);
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM admin_users WHERE id = ?');
        return stmt.get(id);
    }
};

// =================================================================
// QUERIES PARA SESIONES DE ADMINISTRADORES
// =================================================================

export const adminSessionQueries = {
    create: (adminId, sessionToken, expiresAt) => {
        const stmt = db.prepare(`
            INSERT INTO admin_sessions (admin_id, session_token, expires_at)
            VALUES (?, ?, ?)
        `);
        return stmt.run(adminId, sessionToken, expiresAt);
    },

    findByToken: (token) => {
        const stmt = db.prepare(`
            SELECT admin_sessions.*, au.username, au.email 
            FROM admin_sessions
            JOIN admin_users au ON admin_sessions.admin_id = au.id
            WHERE admin_sessions.session_token = ? AND admin_sessions.expires_at > datetime('now')
        `);
        return stmt.get(token);
    },

    deleteByToken: (token) => {
        const stmt = db.prepare('DELETE FROM admin_sessions WHERE session_token = ?');
        return stmt.run(token);
    }
};

// =================================================================
// QUERIES PARA PRODUCTOS
// =================================================================

export const productQueries = {
    create: (productData) => {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, image, category, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            productData.name,
            productData.description,
            productData.price,
            productData.image,
            productData.category,
            productData.stock || 0
        );
    },

    getAll: () => {
        const stmt = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
        return stmt.all();
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
        return stmt.get(id);
    },

    update: (id, productData) => {
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            productData.name,
            productData.description,
            productData.price,
            productData.image,
            productData.category,
            productData.stock,
            id
        );
    },

    delete: (id) => {
        const stmt = db.prepare('UPDATE products SET is_active = 0 WHERE id = ?');
        return stmt.run(id);
    }
};

// =================================================================
// QUERIES PARA ÓRDENES
// =================================================================

export const orderQueries = {
    create: (orderData) => {
        const stmt = db.prepare(`
            INSERT INTO orders (user_id, total, status)
            VALUES (?, ?, ?)
        `);
        return stmt.run(orderData.userId, orderData.total, orderData.status || 'pending');
    },

    getByUser: (userId) => {
        const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId);
    },

    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
        return stmt.get(id);
    },

    updateStatus: (id, status) => {
        const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        return stmt.run(status, id);
    }
};

// =================================================================
// QUERIES PARA ITEMS DE ÓRDENES
// =================================================================

export const orderItemQueries = {
    create: (itemData) => {
        const stmt = db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(itemData.orderId, itemData.productId, itemData.quantity, itemData.price);
    },

    getByOrder: (orderId) => {
        const stmt = db.prepare(`
            SELECT oi.*, p.name as product_name, p.image as product_image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `);
        return stmt.all(orderId);
    }
};

// =================================================================
// UTILIDADES Y FUNCIONES AUXILIARES
// =================================================================

export const utils = {
    getAdminStats: () => {
        try {
            // Obtener estadísticas de usuarios
            const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
            
            // Obtener estadísticas de cursos
            const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses WHERE is_active = 1').get();
            
            // Obtener estadísticas de módulos
            const totalModules = db.prepare('SELECT COUNT(*) as count FROM course_modules').get();
            
            // Obtener estadísticas de productos
            const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
            
            // Obtener estadísticas de órdenes
            const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
            
            // Obtener usuarios recientes (últimos 7 días)
            const recentUsers = db.prepare(`
                SELECT COUNT(*) as count 
                FROM users 
                WHERE created_at >= datetime('now', '-7 days')
            `).get();
            
            return {
                users: {
                    total: totalUsers.count,
                    recent: recentUsers.count
                },
                courses: {
                    total: totalCourses.count
                },
                modules: {
                    total: totalModules.count
                },
                products: {
                    total: totalProducts.count
                },
                orders: {
                    total: totalOrders.count
                }
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                users: { total: 0, recent: 0 },
                courses: { total: 0 },
                modules: { total: 0 },
                products: { total: 0 },
                orders: { total: 0 }
            };
        }
    }
};

console.log('✅ Base de datos y queries inicializados correctamente');
console.log('🔧 Versión con utils exportado correctamente');