// Permission utility functions
export const checkPermission = (userPermissions, feature) => {
  // Check for admin role from multiple possible sources
  const userRole = userPermissions?.role || 
                  userPermissions?.permissions?.role || 
                  userPermissions?.user?.role ||
                  userPermissions?.user?.permissions?.role;
  
  console.log('🔍 Checking permission:', { 
    feature, 
    userRole, 
    hasPermissions: !!userPermissions,
    permissionsKeys: userPermissions ? Object.keys(userPermissions) : null
  });
  
  // If user is admin, automatically grant access to all features
  if (userRole === 'admin') {
    console.log('✅ Admin access granted for:', feature);
    return true;
  }
  
  // Fallback: Check if user has admin-level permissions (multiple ways)
  const hasAdminPermissions = 
    (userPermissions?.['users']?.access === 'admin') ||
    (userPermissions?.['reports']?.access === 'admin') ||
    (userPermissions?.['archive']?.access === 'admin') ||
    (userPermissions?.['archives']?.access === 'admin');
    
  if (hasAdminPermissions) {
    console.log('✅ Admin access granted via permissions for:', feature);
    return true;
  }
  
  if (!userPermissions || !userPermissions[feature]) {
    console.log('❌ Permission denied - no permission data for:', feature);
    return false;
  }

  const permission = userPermissions[feature];
  
  // If not allowed at all (0 or false), deny access
  const result = permission.allowed && permission.allowed !== 0;
  console.log('🔍 Permission check result for', feature, ':', result);
  return result;
};

export const canView = (userPermissions, feature) => {
  return checkPermission(userPermissions, feature);
};

export const canEdit = (userPermissions, feature) => {
  return checkPermission(userPermissions, feature);
};

export const canAdmin = (userPermissions, feature) => {
  return checkPermission(userPermissions, feature);
};

export const getAccessLevel = (userPermissions, feature) => {
  // Check for admin role from multiple possible sources
  const userRole = userPermissions?.role || 
                  userPermissions?.permissions?.role || 
                  userPermissions?.user?.role ||
                  userPermissions?.user?.permissions?.role;
  
  // If user is admin, return admin access level for all features
  if (userRole === 'admin') {
    return 'admin';
  }
  
  // Fallback: Check if user has admin-level permissions
  const hasAdminPermissions = 
    (userPermissions?.['users']?.access === 'admin') ||
    (userPermissions?.['reports']?.access === 'admin') ||
    (userPermissions?.['archive']?.access === 'admin') ||
    (userPermissions?.['archives']?.access === 'admin');
    
  if (hasAdminPermissions) {
    return 'admin';
  }
  
  if (!userPermissions || !userPermissions[feature]) {
    return 'none';
  }
  
  const permission = userPermissions[feature];
  return (permission.allowed && permission.allowed !== 0) ? 'access' : 'none';
}; 