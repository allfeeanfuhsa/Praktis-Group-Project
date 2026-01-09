import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManajemenPraktikum = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    mata_kuliah: '',
    kelas: 'A',
    tahun_pelajaran: '2024/2025',
    semester: '1',
    sks: '3',
    jadwal: '',
    ruangan: ''
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
      alert('Praktikum berhasil dibuat!');
      fetchLabs(); // Refresh list
      // Reset only text fields, keep year/semester for faster entry
      setFormData(prev => ({ ...prev, mata_kuliah: '', jadwal: '', ruangan: '' })); 
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat praktikum');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Hapus praktikum ini? Data yang terkait (Asdos/Nilai) akan hilang.')) {
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
        <div className="card-body">
          <h5 className="card-title mb-3">Tambah Mata Kuliah Praktikum</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            
            <div className="col-md-3">
              <label className="form-label small text-muted">Mata Kuliah</label>
              <input type="text" className="form-control" placeholder="Ex: Pemrograman Web" required
                value={formData.mata_kuliah} onChange={e=>setFormData({...formData, mata_kuliah: e.target.value})}/>
            </div>
            
            <div className="col-md-2">
              <label className="form-label small text-muted">Kelas</label>
              <input type="text" className="form-control" placeholder="Ex: A, B, Pagi" required
                value={formData.kelas} onChange={e=>setFormData({...formData, kelas: e.target.value})}/>
            </div>

            <div className="col-md-2">
              <label className="form-label small text-muted">Tahun Ajar</label>
              <input type="text" className="form-control" placeholder="Ex: 2024/2025" required
                value={formData.tahun_pelajaran} onChange={e=>setFormData({...formData, tahun_pelajaran: e.target.value})}/>
            </div>

            <div className="col-md-1">
              <label className="form-label small text-muted">Smt</label>
              <input type="number" className="form-control" required
                value={formData.semester} onChange={e=>setFormData({...formData, semester: e.target.value})}/>
            </div>

            <div className="col-md-3">
              <label className="form-label small text-muted">Jadwal & Ruangan</label>
              <input type="text" className="form-control" placeholder="Senin 08:00 - Lab 1"
                value={formData.jadwal} onChange={e=>setFormData({...formData, jadwal: e.target.value})}/>
            </div>

            <div className="col-md-1 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100"><i className="bi bi-plus-lg"></i></button>
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
                  <th>Smt</th>
                  <th>Jadwal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                ) : labs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted">Belum ada data praktikum.</td></tr>
                ) : (
                    labs.map(lab => (
                    <tr key={lab.id_praktikum}>
                        <td className="fw-bold">{lab.mata_kuliah}</td>
                        <td><span className="badge bg-secondary">{lab.kelas}</span></td>
                        <td>{lab.tahun_pelajaran}</td>
                        <td>{lab.semester}</td>
                        <td>{lab.jadwal || '-'}</td>
                        <td>
                        <button onClick={() => handleDelete(lab.id_praktikum)} className="btn btn-outline-danger btn-sm">
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