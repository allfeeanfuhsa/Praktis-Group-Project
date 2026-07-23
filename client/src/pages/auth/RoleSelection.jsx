import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getDashboardByRole } from '../../utils/roleHelper';
import { motion } from 'framer-motion';

const RoleSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect single-role users
  useEffect(() => {
    if (user && user.roles && user.roles.length === 1) {
      const targetPath = getDashboardByRole(user.roles);
      navigate(targetPath, { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSelect = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'asdos') navigate('/asdos/dashboard');
    else if (role === 'mahasiswa') navigate('/mahasiswa/dashboard');
  };

  const isMultiRole = user.roles && user.roles.length > 1;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden" style={{ background: 'radial-gradient(circle at top left, #1e293b, #0f172a, #020617)' }}>
      {/* Background Ambient Glow */}
      <div className="position-absolute top-0 start-50 translate-middle-x rounded-circle opacity-20 pointer-events-none" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }}></div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-100" style={{ maxWidth: '850px' }}>
        
        {/* Header Title & Greeting */}
        <div className="text-center mb-5">
          <motion.div variants={itemVariants} className="d-inline-block badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-4 py-2 rounded-pill mb-3 fw-bold tracking-wider text-uppercase" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-shield-check me-2"></i>Multi-Role Access Portal
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="fw-bold text-white mb-2 display-6">
            Selamat Datang, {user.nama || 'User'}! 👋
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-light opacity-75 fs-5 mb-0">
            {isMultiRole 
              ? 'Anda memiliki akses ganda. Silakan pilih ruang kerja yang ingin dimasuki.' 
              : 'Silakan pilih portal dashboard Anda.'}
          </motion.p>
        </div>

        {/* Role Cards Grid */}
        <div className="row g-4 justify-content-center">
          {user.roles.includes('asdos') && (
            <motion.div variants={itemVariants} className="col-md-6 col-lg-5">
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-4 p-4 h-100 d-flex flex-column justify-content-between border-light border-opacity-25 shadow-lg position-relative overflow-hidden"
                onClick={() => handleSelect('asdos')}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="bg-primary bg-opacity-25 p-3 rounded-4 text-primary border border-primary border-opacity-25">
                      <i className="bi bi-person-workspace fs-2"></i>
                    </div>
                    <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill small">
                      Asisten Dosen
                    </span>
                  </div>

                  <h4 className="fw-bold text-white mb-2">Portal Asisten Dosen</h4>
                  <p className="text-light opacity-75 small mb-4" style={{ lineHeight: '1.6' }}>
                    Kelola jadwal pertemuan, unggah materi pembelajaran, berikan penilaian tugas, dan catat presensi mahasiswa.
                  </p>
                </div>

                <div className="pt-3 border-top border-light border-opacity-10 d-flex align-items-center justify-content-between text-primary fw-bold">
                  <span>Masuk Portal Asdos</span>
                  <i className="bi bi-arrow-right fs-5"></i>
                </div>
              </motion.div>
            </motion.div>
          )}

          {user.roles.includes('mahasiswa') && (
            <motion.div variants={itemVariants} className="col-md-6 col-lg-5">
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-4 p-4 h-100 d-flex flex-column justify-content-between border-light border-opacity-25 shadow-lg position-relative overflow-hidden"
                onClick={() => handleSelect('mahasiswa')}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="bg-success bg-opacity-25 p-3 rounded-4 text-success border border-success border-opacity-25">
                      <i className="bi bi-backpack fs-2"></i>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill small">
                      Mahasiswa
                    </span>
                  </div>

                  <h4 className="fw-bold text-white mb-2">Portal Mahasiswa</h4>
                  <p className="text-light opacity-75 small mb-4" style={{ lineHeight: '1.6' }}>
                    Akses jadwal praktikum, pelajari bank materi, kumpulkan berkas tugas, dan kroscek rekapitulasi nilai.
                  </p>
                </div>

                <div className="pt-3 border-top border-light border-opacity-10 d-flex align-items-center justify-content-between text-success fw-bold">
                  <span>Masuk Portal Mahasiswa</span>
                  <i className="bi bi-arrow-right fs-5"></i>
                </div>
              </motion.div>
            </motion.div>
          )}

          {user.roles.includes('admin') && (
            <motion.div variants={itemVariants} className="col-md-6 col-lg-5">
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-4 p-4 h-100 d-flex flex-column justify-content-between border-light border-opacity-25 shadow-lg position-relative overflow-hidden"
                onClick={() => handleSelect('admin')}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="bg-danger bg-opacity-25 p-3 rounded-4 text-danger border border-danger border-opacity-25">
                      <i className="bi bi-shield-lock fs-2"></i>
                    </div>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 px-3 py-1.5 rounded-pill small">
                      Administrator
                    </span>
                  </div>

                  <h4 className="fw-bold text-white mb-2">Portal Administrator</h4>
                  <p className="text-light opacity-75 small mb-4" style={{ lineHeight: '1.6' }}>
                    Manajemen pengguna sistem, pembagian role, pengelolaan master kelas praktikum, dan monitoring aktivitas.
                  </p>
                </div>

                <div className="pt-3 border-top border-light border-opacity-10 d-flex align-items-center justify-content-between text-danger fw-bold">
                  <span>Masuk Portal Admin</span>
                  <i className="bi bi-arrow-right fs-5"></i>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Footer info */}
        <motion.div variants={itemVariants} className="text-center mt-5">
          <small className="text-light opacity-50">
            <i className="bi bi-info-circle me-1"></i>Anda dapat berganti peran kapan saja melalui menu Profil di navbar.
          </small>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default RoleSelection;