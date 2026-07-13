import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useForm } from '../../hooks/useForm';

const ManajemenPraktikum = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
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

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);

  // Dummy session (sementara sebelum backend jadi)
  const dummySessions = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  sesi: i + 1,
  tanggal: "-",
  waktu: "08:00 - 10:00",
  status: "Aktif"
}));

  const handleOpenSession = (lab) => {
  setSelectedLab(lab);
  setShowSessionModal(true);
};

  const handleCloseSession = () => {
  setSelectedLab(null);
  setShowSessionModal(false);
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
   if (editingId) {
    await api.put(`/api/admin/praktikum/${editingId}`, formData);
    alert('Praktikum berhasil diupdate.');
  } else {
  await api.post('/api/admin/praktikum', formData);
  alert('Praktikum berhasil dibuat! 10 sesi telah digenerate.');
  }
      fetchLabs();
      setEditingId(null);
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

  const handleEdit = (lab) => {
  setEditingId(lab.id_praktikum);

  handleChange({
    target: {
      name: 'mata_kuliah',
      value: lab.mata_kuliah,
    },
  });

  handleChange({
    target: {
      name: 'kode_kelas',
      value: lab.kode_kelas,
    },
  });

  handleChange({
    target: {
      name: 'tahun_pelajaran',
      value: lab.tahun_pelajaran,
    },
  });

  handleChange({
    target: {
      name: 'semester',
      value: lab.semester || 1,
    },
  });

  handleChange({
    target: {
      name: 'ruangan',
      value: lab.ruangan,
    },
  });
};
  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-4">Manajemen Praktikum</h3>
      
      {/* 1. INPUT FORM */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
           <h5 className="fw-bold">{editingId ? "Edit Kelas" : "Buat Kelas Baru"}</h5>
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
                        <button type="submit" className="btn btn-primary">
                        {editingId ? "Update Kelas" : "Generate"}
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
                       <td className="text-center">

  {/* Kelola Session */}
  <button
    className="btn btn-outline-info btn-sm me-2"
    title="Kelola Session"
    onClick={() => handleOpenSession(lab)}
  >
    <i className="bi bi-calendar-week"></i>
  </button>

  {/* Edit Kelas */}
  <button
    className="btn btn-outline-primary btn-sm me-2"
    title="Edit Kelas"
    onClick={() => handleEdit(lab)}
  >
    <i className="bi bi-gear"></i>
  </button>

  {/* Hapus */}
  <button
    className="btn btn-outline-danger btn-sm"
    title="Hapus Kelas"
    onClick={() => handleDelete(lab.id_praktikum)}
  >
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
      {showSessionModal && (
<div
    className="modal fade show"
    style={{ display: "block", background: "rgba(0,0,0,.5)" }}
>
    <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">

            <div className="modal-header">
                <h5 className="modal-title fw-bold">
                    <i className="bi bi-calendar-week me-2"></i>
                    Dynamic Session Management
                </h5>

                <button
                    className="btn-close"
                    onClick={handleCloseSession}
                />
            </div>

            <div className="modal-body">

                <div className="mb-4">

                    <h4 className="fw-bold mb-1">
                        {selectedLab?.mata_kuliah}
                    </h4>

                    <div className="text-muted">
                        Kelas {selectedLab?.kode_kelas}
                    </div>

                </div>

                <div className="list-group">

                    {dummySessions.map((session) => (

                        <div
                            key={session.id}
                            className="list-group-item mb-2 rounded shadow-sm"
                        >

                            <div className="d-flex justify-content-between align-items-center">

                                <div>

                                    <h6 className="fw-bold">
                                        Sesi {session.sesi}
                                    </h6>

                                    <small className="text-muted">

                                        {session.tanggal}

                                        <br />

                                        {session.waktu}

                                    </small>

                                </div>

                                <div>

                                    <span className="badge bg-success me-3">

                                        {session.status}

                                    </span>

                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        <i className="bi bi-pencil-square me-1"></i>

                                        Edit

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            <div className="modal-footer">

                <button
                    className="btn btn-secondary"
                    onClick={handleCloseSession}
                >
                    Tutup
                </button>

            </div>

        </div>
    </div>
</div>
)}
    </div>
  );
};

export default ManajemenPraktikum;