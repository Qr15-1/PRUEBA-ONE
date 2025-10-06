// =================================================================
// FUNCIONES DE AUTENTICACIÓN Y SEGURIDAD
// =================================================================

import crypto from 'crypto';
import { userQueries, sessionQueries, adminQueries } from './database.js';

// =================================================================
// HASH DE CONTRASEÑAS
// =================================================================

export function hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password, hashedPassword) {
    const [salt, hash] = hashedPassword.split(':');
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

// =================================================================
// GENERACIÓN DE TOKENS DE SESIÓN
// =================================================================

export function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

export function generateExpirationDate(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

// =================================================================
// REGISTRO DE USUARIO
// =================================================================

export async function registerUser(userData) {
    try {
        // Verificar si el email ya existe
        const existingUser = userQueries.findByEmail(userData.email);
        if (existingUser) {
            return {
                success: false,
                error: 'El email ya está registrado'
            };
        }

        // Validar datos requeridos
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            return {
                success: false,
                error: 'Todos los campos obligatorios deben ser completados'
            };
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return {
                success: false,
                error: 'El formato del email no es válido'
            };
        }

        // Validar contraseña
        if (userData.password.length < 6) {
            return {
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            };
        }

        // Hash de la contraseña
        const passwordHash = hashPassword(userData.password);

        // Crear usuario
        const result = userQueries.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            passwordHash: passwordHash,
            newsletter: userData.newsletter || false
        });

        if (result.changes > 0) {
            return {
                success: true,
                userId: result.lastInsertRowid,
                message: 'Usuario registrado exitosamente'
            };
        } else {
            return {
                success: false,
                error: 'Error al crear el usuario'
            };
        }
    } catch (error) {
        console.error('Error en registerUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}

// =================================================================
// LOGIN DE USUARIO
// =================================================================

export async function loginUser(email, password, rememberMe = false) {
    try {
        // Buscar usuario por email
        const user = userQueries.findByEmail(email);
        if (!user) {
            return {
                success: false,
                error: 'Credenciales inválidas'
            };
        }

        // Verificar contraseña
        if (!verifyPassword(password, user.password_hash)) {
            return {
                success: false,
                error: 'Credenciales inválidas'
            };
        }

        // Generar token de sesión
        const sessionToken = generateSessionToken();
        const expirationDays = rememberMe ? 30 : 7; // 30 días si "recordarme", 7 días si no
        const expiresAt = generateExpirationDate(expirationDays);

        // Crear sesión
        const sessionResult = sessionQueries.create(user.id, sessionToken, expiresAt);
        
        if (sessionResult.changes > 0) {
            return {
                success: true,
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    newsletter: user.newsletter
                },
                sessionToken: sessionToken,
                expiresAt: expiresAt
            };
        } else {
            return {
                success: false,
                error: 'Error al crear la sesión'
            };
        }
    } catch (error) {
        console.error('Error en loginUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}

// =================================================================
// VERIFICAR SESIÓN
// =================================================================

export async function verifySession(sessionToken) {
    try {
        if (!sessionToken) {
            return {
                success: false,
                error: 'Token de sesión requerido'
            };
        }

        const session = sessionQueries.findByToken(sessionToken);
        if (!session) {
            return {
                success: false,
                error: 'Sesión inválida o expirada'
            };
        }

        return {
            success: true,
            user: {
                id: session.user_id,
                firstName: session.first_name,
                lastName: session.last_name,
                email: session.email
            }
        };
    } catch (error) {
        console.error('Error en verifySession:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}

// =================================================================
// LOGOUT DE USUARIO
// =================================================================

export async function logoutUser(sessionToken) {
    try {
        if (!sessionToken) {
            return {
                success: false,
                error: 'Token de sesión requerido'
            };
        }

        const result = sessionQueries.delete(sessionToken);
        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    } catch (error) {
        console.error('Error en logoutUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}

// =================================================================
// AUTENTICACIÓN DE ADMINISTRADORES
// =================================================================

export async function loginAdmin(username, password) {
    try {
        // Buscar administrador por username o email
        let admin = adminQueries.findByUsername(username);
        if (!admin) {
            admin = adminQueries.findByEmail(username);
        }
        
        if (!admin) {
            return {
                success: false,
                error: 'Credenciales inválidas'
            };
        }

        // Verificar contraseña
        if (!verifyPassword(password, admin.password_hash)) {
            return {
                success: false,
                error: 'Credenciales inválidas'
            };
        }

        // Actualizar último login (comentado temporalmente - función no implementada)
        // adminQueries.updateLastLogin(admin.id);

        return {
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        };
    } catch (error) {
        console.error('Error en loginAdmin:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}

export async function createAdmin(adminData) {
    try {
        // Verificar si el admin ya existe
        const existingAdmin = adminQueries.findByEmail(adminData.email) || adminQueries.findByUsername(adminData.username);
        if (existingAdmin) {
            return {
                success: false,
                error: 'El administrador ya existe'
            };
        }

        // Hash de la contraseña
        const passwordHash = hashPassword(adminData.password);

        // Crear administrador
        const result = adminQueries.create({
            username: adminData.username,
            email: adminData.email,
            passwordHash: passwordHash,
            role: adminData.role || 'admin'
        });

        if (result.changes > 0) {
            return {
                success: true,
                adminId: result.lastInsertRowid,
                message: 'Administrador creado exitosamente'
            };
        } else {
            return {
                success: false,
                error: 'Error al crear el administrador'
            };
        }
    } catch (error) {
        console.error('Error en createAdmin:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}

// =================================================================
// LIMPIAR SESIONES EXPIRADAS
// =================================================================

export function cleanExpiredSessions() {
    try {
        const result = sessionQueries.cleanExpired();
        console.log(`🧹 Sesiones expiradas eliminadas: ${result.changes}`);
        return result.changes;
    } catch (error) {
        console.error('Error al limpiar sesiones expiradas:', error);
        return 0;
    }
}

// =================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =================================================================

export function requireAuth(handler) {
    return async (context) => {
        const sessionToken = context.cookies.get('session_token')?.value;
        
        if (!sessionToken) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No autorizado'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const session = await verifySession(sessionToken);
        if (!session.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Sesión inválida'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Agregar usuario al contexto
        context.user = session.user;
        return handler(context);
    };
}
