import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useForm } from '../../hooks/useForm';

const ManajemenPraktikum = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { formData, handleChange, reset } = useForm({
    mata_kuliah: '',
    kode_kelas: 'A',
    tahun_pelajaran: '2024/2025',
    semester: '1',
    sks: '3',
    ruangan: 'Lab B',
    tanggal_mulai: '', 
    waktu_mulai: '08:00',
    waktu_selesai: '10:00'
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const res = await api.get('/api/admin/praktikum');
      setLabs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/praktikum', formData);
      
      alert('Praktikum berhasil dibuat! 10 Sesi Mingguan telah digenerate.');
      fetchLabs();
      reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat praktikum');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Hapus praktikum ini? Data yang terkait (Asdos/Nilai/Sesi) akan hilang.')) {
      try {
        await api.delete(`/api/admin/praktikum/${id}`);
        fetchLabs();
      } catch (err) {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-4">Manajemen Praktikum</h3>
      
      {/* 1. INPUT FORM */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0 fw-bold text-primary">Buat Kelas Baru</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* ROW 1: Basic Info */}
            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label className="form-label small text-muted fw-bold">Mata Kuliah</label>
                    <input type="text" className="form-control" placeholder="Ex: Pemrograman Web" required
                        name="mata_kuliah" value={formData.mata_kuliah} onChange={handleChange}/>
                </div>
                
                <div className="col-md-2">
                    <label className="form-label small text-muted fw-bold">Kode Kelas</label>
                    <input type="text" className="form-control" placeholder="Ex: A, B" required
                        name="kode_kelas" value={formData.kode_kelas} onChange={handleChange}/>
                </div>

                <div className="col-md-2">
                    <label className="form-label small text-muted fw-bold">Tahun Ajar</label>
                    <input type="text" className="form-control" placeholder="Ex: 2024/2025" required
                        name="tahun_pelajaran" value={formData.tahun_pelajaran} onChange={handleChange}/>
                </div>

                <div className="col-md-1">
                    <label className="form-label small text-muted fw-bold">Smt</label>
                    <input type="number" className="form-control" required
                        name="semester" value={formData.semester} onChange={handleChange}/>
                </div>
                
                <div className="col-md-3">
                    <label className="form-label small text-muted fw-bold">Ruangan</label>
                    <select className="form-select" name="ruangan" value={formData.ruangan} onChange={handleChange}>
                        <option value="Lab B">Lab B</option>
                        <option value="Lab C">Lab C</option>
                        <option value="Lab D">Lab D</option>
                        <option value="Lab Cisco">Lab Cisco</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
            </div>

            {/* ROW 2: Scheduling (Auto-Generate Config) */}
            <div className="p-3 bg-light rounded-3 mb-3">
                <h6 className="small fw-bold text-dark mb-3"><i className="bi bi-calendar-check me-2"></i>Konfigurasi Jadwal Otomatis</h6>
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label small text-muted">Tanggal Mulai (Sesi 1)</label>
                        <input type="date" className="form-control" required
                            name="tanggal_mulai" value={formData.tanggal_mulai} onChange={handleChange}/>
                        <div className="form-text small">Sistem akan generate 10 minggu dari tgl ini.</div>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-muted">Jam Mulai</label>
                        <input type="time" className="form-control" required
                            name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange}/>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small text-muted">Jam Selesai</label>
                        <input type="time" className="form-control" required
                            name="waktu_selesai" value={formData.waktu_selesai} onChange={handleChange}/>
                    </div>

                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100 fw-bold">
                            <i className="bi bi-magic me-2"></i>Generate
                        </button>
                    </div>
                </div>
            </div>

          </form>
        </div>
      </div>

      {/* 2. DATA TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mata Kuliah</th>
                  <th>Kelas</th>
                  <th>Tahun</th>
                  <th>Jadwal (Hari, Jam)</th>
                  <th>Ruangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center py-4">Loading data...</td></tr>
                ) : labs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted py-4">Belum ada kelas praktikum.</td></tr>
                ) : (
                    labs.map(lab => (
                    <tr key={lab.id_praktikum}>
                        <td className="fw-bold">{lab.mata_kuliah}</td>
                        {/* ✅ Using kode_kelas */}
                        <td><span className="badge bg-primary bg-opacity-10 text-primary">{lab.kode_kelas}</span></td>
                        <td>{lab.tahun_pelajaran}</td>
                        {/* ✅ Backend generates a string like "Senin, 08:00 - 10:00" in 'jadwal' */}
                        <td>{lab.jadwal || '-'}</td>
                        <td>{lab.ruangan}</td>
                        <td>
                        <button onClick={() => handleDelete(lab.id_praktikum)} className="btn btn-outline-danger btn-sm" title="Hapus Kelas">
                            <i className="bi bi-trash"></i>
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManajemenPraktikum;