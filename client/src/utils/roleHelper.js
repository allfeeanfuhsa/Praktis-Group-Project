// client/src/utils/roleHelper.js

export const getDashboardByRole = (roles) => {
  if (!roles || roles.length === 0) return '/';
  
  // Priority 1: Admin always goes to Admin Dashboard
  if (roles.includes('admin')) return '/admin/dashboard';
  
  // Priority 2: Asdos
  if (roles.includes('asdos')) return '/asdos/dashboard';
  
  // Priority 3: Mahasiswa
  if (roles.includes('mahasiswa')) return '/mahasiswa/dashboard';
  
  // Default fallback
  return '/';
};