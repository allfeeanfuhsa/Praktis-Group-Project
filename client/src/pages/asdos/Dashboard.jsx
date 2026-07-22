import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const DashboardAsdos = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, pendingGrading: 0 });
  const [myClasses, setMyClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/users/asdos-dashboard');
        setStats(res.data.stats || { totalClasses: 0, totalStudents: 0, pendingGrading: 0 });
        setMyClasses(res.data.classes || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const formatDate = (dateString) => {
      if (!dateString) return null;
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '100px !important' }}>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center mt-4">
        <h2 className="display-4 fw-bold text-dark mb-3" style={{ letterSpacing: '-1px' }}>Selamat Datang, Asisten Dosen</h2>
        <p className="text-muted fs-5 fw-light" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Pilih kelas praktikum di bawah ini untuk mulai mengelola pertemuan, materi, penugasan, dan presensi.
        </p>
      </motion.div>

      {/* CLASS CARDS GRID */}
      <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0 text-dark"><i className="bi bi-grid-fill me-2 text-primary"></i>Kelas Praktikum Anda</h4>
      </div>

      {loading ? (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      ) : !myClasses || myClasses.length === 0 ? (
        <div className="alert alert-info border-0 shadow-sm p-4 text-center rounded-4">
          <i className="bi bi-info-circle fs-1 d-block mb-3"></i>
          <h5 className="fw-bold">Belum Ada Kelas</h5>
          <p className="mb-0">Kamu belum ditugaskan ke kelas praktikum manapun. Silakan hubungi Admin.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="row g-4 justify-content-center">
          {myClasses.map((cls) => (
            <motion.div variants={itemVariants} key={cls.id_praktikum} className="col-md-6 col-lg-4">
              <Link 
                to={`/asdos/kelas/${cls.id_praktikum}`}
                className="glass-card rounded-4 p-4 h-100 d-flex flex-column"
              >
                  {/* Card Header: Code & Year */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="badge border border-light text-light px-3 py-2 rounded-pill" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                      Kelas {cls.kode || cls.kode_kelas || 'A'}
                    </span>
                    <span className="text-muted small fw-bold">
                        {cls.tahun_pelajaran || '2023/2024'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="fw-bold text-dark mb-4 text-truncate" title={cls.nama_praktikum}>
                    {cls.nama_praktikum || cls.mata_kuliah}
                  </h3>

                  {/* Info List */}
                  <div className="mt-auto">
                      <div className="d-flex align-items-center mb-3">
                          <div className="bg-light rounded-circle p-2 me-3 text-center" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-people-fill"></i>
                          </div>
                          <div>
                              <div className="small text-muted mb-0 lh-1">Mahasiswa</div>
                              <div className="fw-bold text-dark">{cls.studentCount || 0} Terdaftar</div>
                          </div>
                      </div>
                      
                      <div className="d-flex align-items-center mb-3">
                          <div className="bg-light rounded-circle p-2 me-3 text-center" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-calendar-event"></i>
                          </div>
                          <div>
                              <div className="small text-muted mb-0 lh-1">Sesi Berikutnya</div>
                              <div className="fw-bold text-dark">
                                  {cls.nextSessionDate ? (
                                      cls.isPastSession ? (
                                          `Sesi ${cls.nextSessionSesiKe} (${formatDate(cls.nextSessionDate)}) • Selesai`
                                      ) : (
                                          `Sesi ${cls.nextSessionSesiKe} (${formatDate(cls.nextSessionDate)})`
                                      )
                                  ) : <span className="fst-italic fw-normal">Belum ada jadwal</span>}
                              </div>
                          </div>
                      </div>

                      <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3 text-center" style={{ width: '40px', height: '40px' }}>
                              <i className="bi bi-journal-check"></i>
                          </div>
                          <div className="w-100 d-flex justify-content-between align-items-center">
                              <div>
                                  <div className="small text-muted mb-0 lh-1">Tugas Dinilai</div>
                                  <div className="fw-bold text-dark">
                                      {cls.ungradedCount === 0 ? 'Semua Selesai' : `${cls.ungradedCount} Menunggu`}
                                  </div>
                              </div>
                              {cls.ungradedCount > 0 && (
                                  <span className="badge bg-danger rounded-pill px-2">{cls.ungradedCount}</span>
                              )}
                          </div>
                      </div>
                  </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default DashboardAsdos;