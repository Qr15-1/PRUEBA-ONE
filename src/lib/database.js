// =================================================================
// CONFIGURACIÓN DE BASE DE DATOS SQLITE
// =================================================================

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta de la base de datos
const dbPath = join(__dirname, '../../data/rojasfitt.db');
const dataDir = join(__dirname, '../../data');

// Crear la carpeta data si no existe
try {
    mkdirSync(dataDir, { recursive: true });
    console.log('✅ Carpeta data creada/verificada');
} catch (error) {
    console.log('⚠️ Error creando carpeta data:', error.message);
}

// Crear instancia de la base de datos
const db = new Database(dbPath);

// =================================================================
// CREAR TABLAS
// =================================================================

// Tabla de usuarios
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    newsletter BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

// Tabla de sesiones de usuario
const createSessionsTable = `
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
`;

// Tabla de productos (para la tienda)
const createProductsTable = `
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

// Tabla de carrito de compras
const createCartTable = `
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
)
`;

// Tabla de pedidos
const createOrdersTable = `
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
`;

// Tabla de items de pedidos
const createOrderItemsTable = `
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
)
`;

// Tabla de administradores
const createAdminsTable = `
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
)
`;

// Tabla de cursos
const createCoursesTable = `
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    instructor TEXT NOT NULL,
    level TEXT NOT NULL,
    duration DECIMAL(4,1) NOT NULL,
    students INTEGER DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    originalPrice DECIMAL(10,2) NOT NULL,
    image TEXT NOT NULL,
    videoUrl TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

// Tabla de módulos de cursos (simplificada - incluye videos)
const createCourseModulesTable = `
CREATE TABLE IF NOT EXISTS course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    videoUrl TEXT NOT NULL,
    isFree BOOLEAN DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
)
`;

// =================================================================
// EJECUTAR CREACIÓN DE TABLAS
// =================================================================

try {
    db.exec(createUsersTable);
    db.exec(createSessionsTable);
    db.exec(createProductsTable);
    db.exec(createCartTable);
    db.exec(createOrdersTable);
    db.exec(createOrderItemsTable);
    db.exec(createAdminsTable);
    db.exec(createCoursesTable);
    db.exec(createCourseModulesTable);
    console.log('✅ Base de datos SQLite inicializada correctamente');
} catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
}

// =================================================================
// FUNCIONES DE USUARIOS
// =================================================================

export const userQueries = {
    // Crear usuario
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

    // Buscar usuario por email
    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },

    // Buscar usuario por ID
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },

    // Obtener todos los usuarios
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
        return stmt.all();
    },

    // Actualizar usuario
    update: (id, userData) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET first_name = ?, last_name = ?, phone = ?, newsletter = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            userData.firstName,
            userData.lastName,
            userData.phone || null,
            userData.newsletter ? 1 : 0,
            id
        );
    },

    // Eliminar usuario
    delete: (id) => {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }
};

// =================================================================
// FUNCIONES DE SESIONES
// =================================================================

export const sessionQueries = {
    // Crear sesión
    create: (userId, sessionToken, expiresAt) => {
        const stmt = db.prepare(`
            INSERT INTO user_sessions (user_id, session_token, expires_at)
            VALUES (?, ?, ?)
        `);
        return stmt.run(userId, sessionToken, expiresAt);
    },

    // Buscar sesión por token
    findByToken: (sessionToken) => {
        const stmt = db.prepare(`
            SELECT s.*, u.first_name, u.last_name, u.email
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP
        `);
        return stmt.get(sessionToken);
    },

    // Eliminar sesión
    delete: (sessionToken) => {
        const stmt = db.prepare('DELETE FROM user_sessions WHERE session_token = ?');
        return stmt.run(sessionToken);
    },

    // Limpiar sesiones expiradas
    cleanExpired: () => {
        const stmt = db.prepare('DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP');
        return stmt.run();
    }
};

// =================================================================
// FUNCIONES DE PRODUCTOS
// =================================================================

export const productQueries = {
    // Obtener todos los productos activos
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
        return stmt.all();
    },

    // Obtener producto por ID
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1');
        return stmt.get(id);
    },

    // Crear producto
    create: (productData) => {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, image_url, category, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            productData.name,
            productData.description,
            productData.price,
            productData.imageUrl,
            productData.category,
            productData.stock || 0
        );
    },

    // Actualizar producto
    update: (id, productData) => {
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            productData.name,
            productData.description,
            productData.price,
            productData.imageUrl,
            productData.category,
            productData.stock,
            id
        );
    }
};

// =================================================================
// FUNCIONES DE CARRITO
// =================================================================

export const cartQueries = {
    // Agregar item al carrito
    addItem: (userId, productId, quantity = 1, sessionId = null) => {
        const stmt = db.prepare(`
            INSERT INTO cart_items (user_id, product_id, quantity, session_id)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(userId, productId, quantity, sessionId);
    },

    // Obtener items del carrito
    getItems: (userId = null, sessionId = null) => {
        let query = `
            SELECT ci.*, p.name, p.price, p.image_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE p.is_active = 1
        `;
        
        if (userId) {
            query += ' AND ci.user_id = ?';
        } else if (sessionId) {
            query += ' AND ci.session_id = ?';
        }
        
        query += ' ORDER BY ci.created_at DESC';
        
        const stmt = db.prepare(query);
        return userId ? stmt.all(userId) : stmt.all(sessionId);
    },

    // Actualizar cantidad
    updateQuantity: (itemId, quantity) => {
        const stmt = db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
        return stmt.run(quantity, itemId);
    },

    // Eliminar item del carrito
    removeItem: (itemId) => {
        const stmt = db.prepare('DELETE FROM cart_items WHERE id = ?');
        return stmt.run(itemId);
    },

    // Limpiar carrito
    clear: (userId = null, sessionId = null) => {
        let query = 'DELETE FROM cart_items WHERE';
        if (userId) {
            query += ' user_id = ?';
        } else if (sessionId) {
            query += ' session_id = ?';
        }
        
        const stmt = db.prepare(query);
        return userId ? stmt.run(userId) : stmt.run(sessionId);
    }
};

// =================================================================
// FUNCIONES DE PEDIDOS
// =================================================================

export const orderQueries = {
    // Crear pedido
    create: (orderData) => {
        const stmt = db.prepare(`
            INSERT INTO orders (user_id, total_amount, shipping_address, status)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(
            orderData.userId,
            orderData.totalAmount,
            orderData.shippingAddress,
            orderData.status || 'pending'
        );
    },

    // Agregar item al pedido
    addItem: (orderId, productId, quantity, price) => {
        const stmt = db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(orderId, productId, quantity, price);
    },

    // Obtener pedidos del usuario
    getByUser: (userId) => {
        const stmt = db.prepare(`
            SELECT o.*, 
                   GROUP_CONCAT(p.name || ' x' || oi.quantity) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);
        return stmt.all(userId);
    }
};

// =================================================================
// UTILIDADES
// =================================================================

// =================================================================
// FUNCIONES DE ADMINISTRADORES
// =================================================================

export const adminQueries = {
    // Crear administrador
    create: (adminData) => {
        const stmt = db.prepare(`
            INSERT INTO admins (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(
            adminData.username,
            adminData.email,
            adminData.passwordHash,
            adminData.role || 'admin'
        );
    },

    // Buscar administrador por email
    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM admins WHERE email = ? AND is_active = 1');
        return stmt.get(email);
    },

    // Buscar administrador por username
    findByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM admins WHERE username = ? AND is_active = 1');
        return stmt.get(username);
    },

    // Buscar administrador por ID
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM admins WHERE id = ? AND is_active = 1');
        return stmt.get(id);
    },

    // Actualizar último login
    updateLastLogin: (id) => {
        const stmt = db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
        return stmt.run(id);
    },

    // Obtener todos los administradores
    getAll: () => {
        const stmt = db.prepare('SELECT id, username, email, role, is_active, created_at, last_login FROM admins ORDER BY created_at DESC');
        return stmt.all();
    }
};

// =================================================================
// FUNCIONES DE CURSOS
// =================================================================

export const courseQueries = {
    // Obtener todos los cursos
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM courses WHERE is_active = 1 ORDER BY created_at DESC');
        return stmt.all();
    },

    // Obtener curso por ID
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM courses WHERE id = ? AND is_active = 1');
        return stmt.get(id);
    },

    // Obtener curso por slug
    findBySlug: (slug) => {
        const stmt = db.prepare('SELECT * FROM courses WHERE slug = ? AND is_active = 1');
        return stmt.get(slug);
    },

    // Crear curso
    create: (courseData) => {
        const stmt = db.prepare(`
            INSERT INTO courses (title, category, description, instructor, level, duration, students, price, originalPrice, image, videoUrl, slug)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            courseData.title,
            courseData.category,
            courseData.description,
            courseData.instructor,
            courseData.level,
            courseData.duration,
            courseData.students || 0,
            courseData.price,
            courseData.originalPrice,
            courseData.image,
            courseData.videoUrl,
            courseData.slug
        );
    },

    // Actualizar curso
    update: (id, courseData) => {
        const stmt = db.prepare(`
            UPDATE courses 
            SET title = ?, category = ?, description = ?, instructor = ?, level = ?, duration = ?, 
                students = ?, price = ?, originalPrice = ?, image = ?, videoUrl = ?, slug = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        // Generar slug automáticamente basado en el título
        const generateSlug = (title) => {
            return title.toLowerCase()
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        };

        return stmt.run(
            courseData.title,
            courseData.category,
            courseData.description,
            courseData.instructor || 'Instructor',
            courseData.level,
            courseData.duration,
            courseData.students || 0,
            courseData.price,
            courseData.originalPrice,
            courseData.image,
            courseData.videoUrl || '',
            generateSlug(courseData.title),
            id
        );
    },

    // Eliminar curso
    delete: (id) => {
        const stmt = db.prepare('UPDATE courses SET is_active = 0 WHERE id = ?');
        return stmt.run(id);
    }
};

// =================================================================
// FUNCIONES DE MÓDULOS DE CURSOS
// =================================================================

export const moduleQueries = {
    // Obtener módulos de un curso
    getByCourse: (courseId) => {
        const stmt = db.prepare('SELECT * FROM course_modules WHERE course_id = ? AND is_active = 1 ORDER BY order_index ASC');
        return stmt.all(courseId);
    },

    // Obtener módulo por ID
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM course_modules WHERE id = ? AND is_active = 1');
        return stmt.get(id);
    },

    // Crear módulo (ahora incluye video)
    create: (moduleData) => {
        const stmt = db.prepare(`
            INSERT INTO course_modules (course_id, title, description, duration, videoUrl, isFree, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            moduleData.courseId,
            moduleData.title,
            moduleData.description,
            moduleData.duration,
            moduleData.videoUrl,
            moduleData.isFree ? 1 : 0,
            moduleData.orderIndex || 0
        );
    },

    // Actualizar módulo (ahora incluye video)
    update: (id, moduleData) => {
        const stmt = db.prepare(`
            UPDATE course_modules 
            SET title = ?, description = ?, duration = ?, videoUrl = ?, isFree = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            moduleData.title,
            moduleData.description,
            moduleData.duration,
            moduleData.videoUrl,
            moduleData.isFree ? 1 : 0,
            moduleData.orderIndex || 0,
            id
        );
    },

    // Eliminar módulo
    delete: (id) => {
        const stmt = db.prepare('UPDATE course_modules SET is_active = 0 WHERE id = ?');
        return stmt.run(id);
    },

    // Obtener todos los módulos (para admin)
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM course_modules WHERE is_active = 1 ORDER BY course_id, order_index ASC');
        return stmt.all();
    }
};


export const utils = {
    // Cerrar conexión
    close: () => {
        db.close();
    },

    // Obtener estadísticas
    getStats: () => {
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
        const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
        const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins WHERE is_active = 1').get();
        const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses WHERE is_active = 1').get();
        const moduleCount = db.prepare('SELECT COUNT(*) as count FROM course_modules WHERE is_active = 1').get();
        
        return {
            users: userCount.count,
            products: productCount.count,
            orders: orderCount.count,
            admins: adminCount.count,
            courses: courseCount.count,
            modules: moduleCount.count
        };
    },

    // Obtener estadísticas detalladas para admin
    getAdminStats: () => {
        try {
            console.log('📊 Obteniendo estadísticas de administración...');
            
            const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
            console.log('👥 Usuarios totales:', userCount);
            
            const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
            console.log('📦 Productos activos:', productCount);
            
            const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses WHERE is_active = 1').get();
            console.log('🎓 Cursos activos:', courseCount);
            
            const moduleCount = db.prepare('SELECT COUNT(*) as count FROM course_modules WHERE is_active = 1').get();
            console.log('📚 Módulos activos:', moduleCount);
            
            const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
            console.log('📋 Pedidos totales:', orderCount);
            
            const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"').get();
            console.log('💰 Ingresos totales:', totalRevenue);
            
            const recentUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE created_at >= datetime("now", "-7 days")').get();
            console.log('🆕 Usuarios recientes:', recentUsers);
            
            const recentOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE created_at >= datetime("now", "-7 days")').get();
            console.log('🆕 Pedidos recientes:', recentOrders);
            
            const stats = {
                users: {
                    total: userCount?.count || 0,
                    recent: recentUsers?.count || 0
                },
                products: {
                    total: productCount?.count || 0
                },
                courses: {
                    total: courseCount?.count || 0
                },
                modules: {
                    total: moduleCount?.count || 0
                },
                orders: {
                    total: orderCount?.count || 0,
                    recent: recentOrders?.count || 0,
                    revenue: totalRevenue?.total || 0
                }
            };
            
            console.log('✅ Estadísticas generadas:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {
                users: { total: 0, recent: 0 },
                products: { total: 0 },
                courses: { total: 0 },
                modules: { total: 0 },
                orders: { total: 0, recent: 0, revenue: 0 }
            };
        }
    }
};

export default db;
