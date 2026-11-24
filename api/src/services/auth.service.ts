/** Contiene operaciones de registro, inicio de sesión y perfil de usuarios. */

import bcrypt from 'bcryptjs';
import { Usuario, RolUsuario, TipoPublicador } from '../models/usuario.model';

export interface DatosRegistro {
  nombre_completo: string;
  email: string;
  password: string;
  telefono?: string | null;
  rol: Exclude<RolUsuario, 'administrador'>;
  tipo_publicador?: TipoPublicador | null;
  descripcion?: string | null;
}

export interface DatosPerfil {
  nombre_completo: string;
  telefono?: string | null;
  tipo_publicador?: TipoPublicador | null;
  descripcion?: string | null;
}

// Crea al usuario con hash seguro; la contraseña original nunca se persiste.
export async function registrarUsuario(datos: DatosRegistro): Promise<Usuario> {
  const password_hash = await bcrypt.hash(datos.password, 12);
  return Usuario.create({
    nombre_completo: datos.nombre_completo.trim(),
    email: datos.email.trim().toLowerCase(),
    password_hash,
    rol: datos.rol,
    telefono: datos.telefono?.trim() || null,
    tipo_publicador: datos.rol === 'publicador' ? datos.tipo_publicador ?? null : null,
    descripcion: datos.descripcion?.trim() || null,
  });
}

// Busca por email e impide iniciar sesión a cuentas desactivadas.
export async function validarCredenciales(email: string, password: string): Promise<Usuario | null> {
  const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase(), activo: true } });
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) return null;
  return usuario;
}

// Solo permite cambiar datos del perfil propio, sin aceptar campos de acceso/rol.
export async function actualizarPerfil(id: number, datos: DatosPerfil): Promise<Usuario | null> {
  const usuario = await Usuario.findOne({ where: { id, activo: true } });
  if (!usuario) return null;
  await usuario.update({
    nombre_completo: datos.nombre_completo.trim(),
    telefono: datos.telefono?.trim() || null,
    tipo_publicador: usuario.rol === 'publicador' ? datos.tipo_publicador ?? usuario.tipo_publicador : null,
    descripcion: datos.descripcion?.trim() || null,
  });
  return usuario;
}

// Devuelve solo información segura del usuario; omite password_hash.
export function perfilPublico(usuario: Usuario) {
  return {
    id: usuario.id,
    nombre_completo: usuario.nombre_completo,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
    tipo_publicador: usuario.tipo_publicador,
    descripcion: usuario.descripcion,
    activo: usuario.activo,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  };
}
