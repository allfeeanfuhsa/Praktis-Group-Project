import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/authContext';

const Profile = () => {
    const { id } = useParams();
    const { user: authUser } = useAuth();

    // Data State
    const [profile, setProfile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        nama: '',
        email: '',
        prodi: '',
        angkatan: '',
        nim: ''
        // password: '' // Optional: Add password field if you want to allow changes here
    });

    // Class Assignment State (Admin Only)
    const [selectedClass, setSelectedClass] = useState('');

    // Permissions
    // If URL has ID, we are viewing someone else. If no ID, we are viewing ourselves.
    const isViewingOther = id && parseInt(id) !== authUser?.id;
    const isSelf = !isViewingOther;
    const isAdmin = authUser?.role === 'admin';
    const canAssignClasses = isAdmin && isViewingOther; // Admin viewing someone else

    useEffect(() => {
        fetchProfile();
        if (canAssignClasses) {
            fetchAvailableClasses();
        }
    }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const endpoint = isViewingOther ? `/api/users/admin/users/${id}` : '/api/users/profile';
            const res = await api.get(endpoint);

            let userData = {};

            // Normalize data structure between endpoints
            if (res.data.user) {
                userData = res.data.user;
                setClasses(res.data.classes || []);
            } else {
                userData = res.data;
                // Note: If /profile doesn't return classes, they won't show for self. 
                // You might need to add include: [PraktikumUserRole] to getProfile in backend.
                setClasses(res.data.classes || []);
            }

            setProfile(userData);

            // Initialize Edit Form
            setEditForm({
                nama: userData.nama || '',
                email: userData.email || '',
                prodi: userData.prodi || '',
                angkatan: userData.angkatan || '',
                nim: userData.nim || ''
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableClasses = async () => {
        try {
            // Ensure this endpoint exists in contentController or adminController
            const res = await api.get('/api/admin/praktikum-list');
            setAvailableClasses(res.data || []);
        } catch (err) { console.error("Failed to load class list"); }
    };

    // --- HANDLERS ---

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            if (isViewingOther) {
                // New Endpoint for Admin editing specific user
                await api.put(`/api/users/admin/users/${profile.id_user}`, editForm);
            } else {
                // Existing Endpoint for Self edit
                await api.put('/api/users/profile', editForm);
            }
            alert("Profil berhasil diperbarui!");
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal update profile");
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            await api.post('/api/users/admin/enroll', {
                id_user: profile.id_user,
                id_praktikum: selectedClass,
                role_name: 'mahasiswa'
            });
            alert("User berhasil dimasukkan ke kelas!");
            fetchProfile();
            setSelectedClass('');
        } catch (err) {
            alert(err.response?.data?.message || "Gagal assign kelas");
        }
    };

    const handleUnenroll = async (praktikumId) => {
        if (!window.confirm("Keluarkan user dari kelas ini?")) return;
        try {
            await api.post('/api/users/admin/unenroll', {
                id_user: profile.id_user,
                id_praktikum: praktikumId
            });
            fetchProfile();
        } catch (err) {
            alert("Gagal unenroll");
        }
    };

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (!profile) return <div className="alert alert-danger">User tidak ditemukan</div>;

    return (
        <div className="container-fluid p-4">

            {/* HEADER SECTION */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                <div className="bg-primary bg-gradient p-5 text-center text-white" style={{ minHeight: '160px' }}>
                    {/* Background Decoration */}
                </div>
                <div className="card-body text-center position-relative" style={{ marginTop: '-80px' }}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${profile.nama}&background=random&size=128`}
                        className="rounded-circle border border-4 border-white shadow"
                        alt="Profile"
                        width="128"
                        height="128"
                    />
                    <h3 className="fw-bold mt-3 mb-1">{profile.nama}</h3>
                    <p className="text-muted mb-3">{profile.email}</p>

                    <div className="d-flex justify-content-center gap-2">
                        {profile.nim && <span className="badge bg-light text-dark border px-3 py-2">{profile.nim}</span>}
                        {profile.prodi && <span className="badge bg-light text-dark border px-3 py-2">{profile.prodi}</span>}
                    </div>
                </div>
            </div>

            <div className="row g-4">

                {/* LEFT COLUMN: Profile Details (Editable) */}
                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Informasi Akun</h5>
                            {isSelf && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline-primary fw-bold">
                                    <i className="bi bi-pencil-square me-2"></i>Edit
                                </button>
                            )}
                        </div>
                        <div className="card-body p-4">
                            {isEditing ? (
                                /* === EDIT FORM === */
                                <form onSubmit={handleSaveProfile}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Nama Lengkap</label>
                                        <input type="text" name="nama" className="form-control" value={editForm.nama} onChange={handleEditChange} required />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold text-muted">NIM</label>
                                            {/* Usually NIM is distinct/unique, be careful allowing edits */}
                                            <input type="text" name="nim" className="form-control" value={editForm.nim} onChange={handleEditChange} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold text-muted">Angkatan</label>
                                            <input type="number" name="angkatan" className="form-control" value={editForm.angkatan} onChange={handleEditChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Program Studi</label>
                                        <input type="text" name="prodi" className="form-control" value={editForm.prodi} onChange={handleEditChange} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">Email</label>
                                        <input type="email" name="email" className="form-control" value={editForm.email} onChange={handleEditChange} required />
                                    </div>

                                    <div className="d-flex gap-2 justify-content-end">
                                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-light">Batal</button>
                                        <button type="submit" className="btn btn-primary fw-bold">Simpan Perubahan</button>
                                    </div>
                                </form>
                            ) : (
                                /* === VIEW MODE === */
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Nama Lengkap</span>
                                        <span className="fw-bold text-end">{profile.nama}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">NIM</span>
                                        <span className="fw-bold">{profile.nim || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Email</span>
                                        <span className="fw-bold">{profile.email}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Prodi</span>
                                        <span className="fw-bold">{profile.prodi || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Angkatan</span>
                                        <span className="fw-bold">{profile.angkatan || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Bergabung Sejak</span>
                                        <span className="fw-bold">{new Date(profile.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Classes (View Only for User, Edit for Admin) */}
                <div className="col-lg-7">

                    {/* 1. Admin Assignment Tool */}
                    {canAssignClasses && (
                        <div className="card shadow-sm border-0 mb-4 bg-light">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-shield-lock-fill me-2"></i>Admin Zone: Enroll User</h6>
                                <form onSubmit={handleEnroll} className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        <option value="">-- Pilih Kelas Praktikum --</option>
                                        {availableClasses.map(cls => (
                                            <option key={cls.id_praktikum} value={cls.id_praktikum}>
                                                {cls.mata_kuliah} - Kelas {cls.kode_kelas}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="btn btn-primary px-4"><i className="bi bi-plus-lg"></i></button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* 2. Class List */}
                    <div className="card shadow-sm border-0 rounded-4 h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Kelas Praktikum</h5>
                        </div>
                        <div className="card-body p-0">
                            {classes.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-journal-x fs-1 opacity-25 mb-2 d-block"></i>
                                    User ini belum terdaftar di kelas manapun.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light small text-uppercase">
                                            <tr>
                                                <th className="ps-4 py-3">Mata Kuliah</th>
                                                <th className="py-3">Role</th>
                                                <th className="py-3 text-end pe-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classes.map((cls, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4">
                                                        <div className="fw-bold text-dark">{cls.nama_praktikum}</div>
                                                        <small className="text-muted">
                                                            Kelas {cls.kode_kelas} &bull; {cls.tahun}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${cls.role === 'asdos' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                                            {cls.role}
                                                        </span>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        {canAssignClasses ? (
                                                            <button
                                                                onClick={() => handleUnenroll(cls.id_praktikum)}
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Keluarkan dari kelas"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        ) : (
                                                            <span className="badge bg-success">Aktif</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
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

export default Profile;