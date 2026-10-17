import { createContext, useContext } from 'react';
import { can, type Permission, type Role } from './permissions';
export const AccessContext = createContext<Role>('Owner');
export function usePermission(permission?: Permission) {
  return can(useContext(AccessContext), permission ?? 'monitoring');
}
