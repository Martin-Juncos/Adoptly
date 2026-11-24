import { RolUsuario } from '../models/usuario.model';

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; rol: RolUsuario };
    }
  }
}

export {};
