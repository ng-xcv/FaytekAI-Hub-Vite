import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';

const PermissionsContext = createContext({ can: () => false, permissions: null, isAdmin: false, role: null });

PermissionsProvider.propTypes = { children: PropTypes.node };

export function PermissionsProvider({ children }) {
  const { user } = useAuth();
  const permissions = user?.permissions || null;
  const role = user?.role || null;
  const isAdmin = role === 'admin' || role === 'superadmin';

  const can = useMemo(() => (module, action) => {
    if (!user) return false;
    if (isAdmin) return true;
    return Boolean(permissions?.[module]?.[action]);
  }, [user, isAdmin, permissions]);

  return (
    <PermissionsContext.Provider value={{ can, permissions, isAdmin, role }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionsContext);
export default PermissionsContext;
