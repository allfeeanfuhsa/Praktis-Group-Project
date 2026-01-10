import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useForm } from '../../hooks/useForm';

const ManajemenAsdos = () => {
  // Data States
  const [praktikums, setPraktikums] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentAsdos, setCurrentAsdos] = useState([]);
  
  // Selection States
  const [selectedPraktikum, setSelectedPraktikum] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);

  // 1. Load Initial Data (Classes & Users)
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [resPrak, resUsers] = await Promise.all([
            api.get('/api/admin/praktikum'),
            api.get('/api/admin/users')
        ]);
        setPraktikums(resPrak.data);
        setUsers(resUsers.data); 
      } catch (err) {
        console.error("Error loading init data", err);
      }
    };
    fetchInitData();
  }, []);

  // 2. Fetch Asdos when a Class is selected
  useEffect(() => {
    if (!selectedPraktikum) {
        setCurrentAsdos([]);
        return;
    }
    fetchAsdosList();
  }, [selectedPraktikum]);

  const fetchAsdosList = async () => {
    try {
        setLoading(true);
        const res = await api.get(`/api/admin/asdos?id_praktikum=${selectedPraktikum}`);
        setCurrentAsdos(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // 3. Handle Assign Asdos
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPraktikum || !selectedUser) return alert("Pilih Praktikum dan Mahasiswa");

    try {
        await api.post('/api/admin/asdos', {
            id_praktikum: selectedPraktikum,
            id_user: selectedUser
        });
        alert("Berhasil menambahkan Asdos");
        fetchAsdosList(); // Refresh list
        setSelectedUser(''); // Reset user selection
    } catch (err) {
        alert(err.response?.data?.message || "Gagal menambahkan Asdos");
    }
  };

  // 4. Handle Remove Asdos
  const handleRemove = async (id_user) => {
    if(!window.confirm("Hapus akses Asdos untuk user ini?")) return;

    try {
        // Axios delete with body requires 'data' property
        await api.delete('/api/admin/asdos', {
            data: { id_praktikum: selectedPraktikum, id_user }
        });
        fetchAsdosList();
    } catch (err) {
        alert("Gagal menghapus");
    }
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-4">Penugasan Asisten Dosen</h3>

      <div className="row">
        {/* LEFT: Assignment Form */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">1. Pilih Kelas</h5>
              <select 
                className="form-select mb-3" 
                value={selectedPraktikum}
                onChange={(e) => setSelectedPraktikum(e.target.value)}
              >
                <option value="">-- Pilih Praktikum --</option>
                {praktikums.map(p => (
                    <option key={p.id_praktikum} value={p.id_praktikum}>
                        {p.mata_kuliah} - {p.kelas || 'Reguler'} ({p.tahun_pelajaran})
                    </option>
                ))}
              </select>

              <h5 className="card-title mb-3">2. Pilih Mahasiswa</h5>
              <form onSubmit={handleAssign}>
                <select 
                    className="form-select mb-3"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={!selectedPraktikum}
                >
                    <option value="">-- Cari Mahasiswa --</option>
                    {users.map(u => (
                        <option key={u.id_user} value={u.id_user}>
                            {u.nim} - {u.nama}
                        </option>
                    ))}
                </select>
                
                <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={!selectedPraktikum || !selectedUser}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> Tugaskan Sebagai Asdos
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT: List of Active Asdos */}
        <div className="col-md-8">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Daftar Asdos Aktif (Kelas Terpilih)</h5>
                </div>
                <div className="card-body">
                    {!selectedPraktikum ? (
                        <div className="text-center text-muted py-4">
                            Silakan pilih Praktikum di menu sebelah kiri.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nama</th>
                                        <th>NIM</th>
                                        <th>Email</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAsdos.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center">Belum ada Asdos untuk kelas ini.</td></tr>
                                    ) : (
                                        currentAsdos.map(item => (
                                            <tr key={item.id_user}>
                                                <td>{item.User?.nama}</td>
                                                <td>{item.User?.nim}</td>
                                                <td>{item.User?.email}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleRemove(item.id_user)} 
                                                        className="btn btn-outline-danger btn-sm"
                                                    >
                                                        <i className="bi bi-trash"></i> Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManajemenAsdos;