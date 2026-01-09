import React, { useEffect } from 'react'; // 1. Import useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getDashboardByRole } from '../../utils/roleHelper'; // 2. Import the helper we made

const RoleSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 3. AUTO-REDIRECT LOGIC
  // If a user manually types "/auth/role-selection" but only has 1 role,
  // kick them to their correct dashboard immediately.
  useEffect(() => {
    if (user && user.roles && user.roles.length === 1) {
      const targetPath = getDashboardByRole(user.roles);
      navigate(targetPath, { replace: true }); // 'replace' prevents back-button loops
    }
  }, [user, navigate]);

  // Safety check to prevent rendering if user is null (though ProtectedRoute handles this)
  if (!user) return null;

  const handleSelect = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'asdos') navigate('/asdos/dashboard');
    else if (role === 'mahasiswa') navigate('/mahasiswa/dashboard');
  };

  // 4. DYNAMIC TEXT (Optional Polish)
  // Just in case the redirect is slow or we want to support single-role view later,
  // let's make the text make sense.
  const isMultiRole = user.roles.length > 1;

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 text-center" style={{ maxWidth: '500px', width: '100%' }}>
        
        <h3 className="mb-4">
            {isMultiRole ? "Pilih Peran Masuk" : "Lanjutkan Masuk"}
        </h3>
        
        <p className="text-muted mb-4">
            {isMultiRole 
                ? "Anda memiliki akses ganda. Silakan pilih dashboard." 
                : "Silakan masuk ke dashboard Anda."}
        </p>
        
        <div className="d-grid gap-3">
          {user.roles.includes('admin') && (
            <button onClick={() => handleSelect('admin')} className="btn btn-outline-danger btn-lg">
              <i className="bi bi-shield-lock me-2"></i> Administrator
            </button>
          )}

          {user.roles.includes('asdos') && (
            <button onClick={() => handleSelect('asdos')} className="btn btn-outline-primary btn-lg">
              <i className="bi bi-person-workspace me-2"></i> Asisten Dosen
            </button>
          )}

          {user.roles.includes('mahasiswa') && (
            <button onClick={() => handleSelect('mahasiswa')} className="btn btn-outline-success btn-lg">
              <i className="bi bi-backpack me-2"></i> Mahasiswa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;