import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useForm } from '../../hooks/useForm';

const ManajemenUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { formData, handleChange, reset } = useForm({
        nama: '',
        email: '',
        password: '',
        role: 'mahasiswa',
        nim: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus user ini?')) {
            await api.delete(`/api/admin/users/${id}`);
            fetchUsers();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/users', formData);
            alert('User created!');
            fetchUsers();
            reset();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating user');
        }
    };

    return (
        <div className="container-fluid">
            <h3 className="fw-bold mb-4">Manajemen User</h3>

            {/* Create Form */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Tambah User Baru</h5>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Nama Lengkap"
                                name="nama" value={formData.nama} onChange={handleChange} required />
                        </div>
                        <div className="col-md-2">
                            <input type="text" className="form-control" placeholder="NIM"
                                name="nim" value={formData.nim} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <input type="email" className="form-control" placeholder="Email"
                                name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="col-md-2">
                            <input type="password" className="form-control" placeholder="Password"
                                name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                                <option value="mahasiswa">Mahasiswa</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-primary"><i className="bi bi-plus-lg"></i> Tambah User</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* List Users */}
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Nama</th>
                                    <th>NIM</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id_user}>
                                        <td>{u.id_user}</td>
                                        <td>{u.nama}</td>
                                        <td>{u.nim || '-'}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            {u.Roles.map(r => (
                                                <span key={r.deskripsi} className={`badge me-1 ${r.deskripsi === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                    {r.deskripsi}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            {/* NEW: Profile/Detail Button */}
                                            <Link
                                                to={`/admin/user/${u.id_user}`}
                                                className="btn btn-outline-primary btn-sm me-2"
                                                title="Lihat Profil & Assign Kelas"
                                            >
                                                <i className="bi bi-person-gear"></i>
                                            </Link>

                                            <button onClick={() => handleDelete(u.id_user)} className="btn btn-outline-danger btn-sm">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManajemenUser;