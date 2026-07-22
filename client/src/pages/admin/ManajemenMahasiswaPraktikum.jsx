import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const ManajemenMahasiswaPraktikum = () => {
    const { id } = useParams();
    const idPraktikum = parseInt(id, 10);

    const [users, setUsers] = useState([]);
    const [praktikumDetails, setPraktikumDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // States for Enrolled Table
    const [enrolledSearch, setEnrolledSearch] = useState('');
    const [enrolledPage, setEnrolledPage] = useState(1);

    // States for Available Table
    const [availableSearch, setAvailableSearch] = useState('');
    const [availablePage, setAvailablePage] = useState(1);
    const [filterProdi, setFilterProdi] = useState('');
    const [filterAngkatan, setFilterAngkatan] = useState('');

    const itemsPerPage = 5; // Use smaller page size for two tables

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idPraktikum]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, praktikumRes] = await Promise.all([
                api.get('/api/admin/users?limit=1000'), // ensure we get enough users or change if server paginates
                api.get('/api/admin/praktikum')
            ]);

            // Extract users
            const usersList = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.data || []);
            setUsers(usersList);

            // Extract praktikum details
            const praktikumList = praktikumRes.data.data || [];
            const currentPraktikum = praktikumList.find(p => p.id_praktikum === idPraktikum);
            setPraktikumDetails(currentPraktikum);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (idUser) => {
        try {
            await api.post('/api/admin/mahasiswa_praktikum', {
                id_user: idUser,
                id_praktikum: idPraktikum
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error enrolling student');
        }
    };

    const handleRemove = async (idUser) => {
        if (!window.confirm("Hapus mahasiswa dari kelas ini?")) return;
        try {
            await api.delete('/api/admin/mahasiswa_praktikum', {
                data: { id_user: idUser, id_praktikum: idPraktikum }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error removing student');
        }
    };

    // Filter Logic
    // 1. Exclude system admins from student lists
    const nonAdminUsers = users.filter(u => !u.Roles?.some(r => r.deskripsi === 'admin'));

    // 2. Enrolled students in THIS specific class
    const enrolledUsers = nonAdminUsers.filter(u =>
        u.PraktikumUserRoles?.some(pur => String(pur.id_praktikum) === String(idPraktikum) && pur.Role?.deskripsi?.toLowerCase() === 'mahasiswa')
    );

    // 3. Available students: Any non-admin user not yet enrolled in THIS class (neither as student nor as asdos for THIS class)
    const availableUsers = nonAdminUsers.filter(u =>
        !u.PraktikumUserRoles?.some(pur => String(pur.id_praktikum) === String(idPraktikum))
    );

    // Apply Search/Filters to Enrolled
    const filteredEnrolled = enrolledUsers.filter(u =>
        (u.nama && u.nama.toLowerCase().includes(enrolledSearch.toLowerCase())) ||
        (u.nim && u.nim.toLowerCase().includes(enrolledSearch.toLowerCase()))
    );

    // Apply Search/Filters to Available
    const filteredAvailable = availableUsers.filter(u => {
        const matchesSearch = (u.nama && u.nama.toLowerCase().includes(availableSearch.toLowerCase())) ||
            (u.nim && u.nim.toLowerCase().includes(availableSearch.toLowerCase()));
        const matchesProdi = filterProdi === '' || u.prodi === filterProdi;
        const matchesAngkatan = filterAngkatan === '' || String(u.angkatan) === filterAngkatan;
        return matchesSearch && matchesProdi && matchesAngkatan;
    });

    // Pagination bounds
    const paginatedEnrolled = filteredEnrolled.slice((enrolledPage - 1) * itemsPerPage, enrolledPage * itemsPerPage);
    const paginatedAvailable = filteredAvailable.slice((availablePage - 1) * itemsPerPage, availablePage * itemsPerPage);

    const prodiOptions = [
        "Informatika", "Sistem Informasi", "Teknik Industri", "Teknik Sipil",
        "Ilmu & Teknologi Pangan", "Teknik Lingkungan", "Manajemen", "Akuntansi",
        "Hubungan Internasional", "Public Policy", "Ilmu Komunikasi", "Lainnya"
    ];

    if (loading) {
        return <div className="text-center py-5">Loading data...</div>;
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4 gap-3">
                <Link to="/admin/praktikum" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-arrow-left"></i> Kembali
                </Link>
                <div>
                    <h3 className="fw-bold mb-0">Manajemen Mahasiswa Praktikum</h3>
                    {praktikumDetails && (
                        <p className="text-muted mb-0">
                            {praktikumDetails.mata_kuliah} - Kelas {praktikumDetails.kode_kelas} ({praktikumDetails.tahun_pelajaran})
                        </p>
                    )}
                </div>
            </div>

            {/* ENROLLED STUDENTS TABLE */}
            <div className="card shadow-sm border-0 mb-4 border-top border-primary border-3">
                <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                        <i className="bi bi-people-fill text-primary me-2"></i>Mahasiswa Terdaftar ({filteredEnrolled.length})
                    </h5>
                    <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
                        <input type="text" className="form-control border-start-0 bg-light" placeholder="Cari nama atau NIM..."
                            value={enrolledSearch} onChange={(e) => { setEnrolledSearch(e.target.value); setEnrolledPage(1); }} />
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4">NIM</th>
                                    <th>Nama Mahasiswa</th>
                                    <th>Program Studi</th>
                                    <th>Angkatan</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEnrolled.length > 0 ? paginatedEnrolled.map(user => (
                                    <tr key={user.id_user}>
                                        <td className="px-4">{user.nim || '-'}</td>
                                        <td className="fw-medium">{user.nama}</td>
                                        <td>{user.prodi || '-'}</td>
                                        <td>{user.angkatan || '-'}</td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                title="Hapus dari kelas"
                                                onClick={() => handleRemove(user.id_user)}
                                            >
                                                <i className="bi bi-person-dash"></i> Hapus
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">Belum ada mahasiswa terdaftar.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-2">
                    <span className="small text-muted">Halaman {enrolledPage} dari {Math.max(1, Math.ceil(filteredEnrolled.length / itemsPerPage))}</span>
                    <div className="btn-group">
                        <button className="btn btn-sm btn-outline-secondary" disabled={enrolledPage === 1} onClick={() => setEnrolledPage(p => p - 1)}>Prev</button>
                        <button className="btn btn-sm btn-outline-secondary" disabled={enrolledPage >= Math.ceil(filteredEnrolled.length / itemsPerPage)} onClick={() => setEnrolledPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>

            {/* AVAILABLE STUDENTS TABLE */}
            <div className="card shadow-sm border-0 border-top border-success border-3">
                <div className="card-header bg-white py-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                        <h5 className="mb-0 fw-bold">
                            <i className="bi bi-person-plus text-success me-2"></i>Daftar Tersedia ({filteredAvailable.length})
                        </h5>
                        <div className="d-flex gap-2">
                            <div className="input-group input-group-sm" style={{ width: '250px' }}>
                                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-start-0 bg-light" placeholder="Cari nama atau NIM..."
                                    value={availableSearch} onChange={(e) => { setAvailableSearch(e.target.value); setAvailablePage(1); }} />
                            </div>
                        </div>
                    </div>
                    {/* Filters Row */}
                    <div className="d-flex gap-2 mt-2">
                        <select className="form-select form-select-sm w-auto" value={filterProdi} onChange={(e) => { setFilterProdi(e.target.value); setAvailablePage(1); }}>
                            <option value="">Semua Prodi</option>
                            {prodiOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select className="form-select form-select-sm w-auto" value={filterAngkatan} onChange={(e) => { setFilterAngkatan(e.target.value); setAvailablePage(1); }}>
                            <option value="">Semua Angkatan</option>
                            {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4">NIM</th>
                                    <th>Nama Mahasiswa</th>
                                    <th>Program Studi</th>
                                    <th>Angkatan</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAvailable.length > 0 ? paginatedAvailable.map(user => (
                                    <tr key={user.id_user}>
                                        <td className="px-4">{user.nim || '-'}</td>
                                        <td className="fw-medium">{user.nama}</td>
                                        <td>{user.prodi || '-'}</td>
                                        <td>{user.angkatan || '-'}</td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-success"
                                                title="Tambahkan ke kelas"
                                                onClick={() => handleAdd(user.id_user)}
                                            >
                                                <i className="bi bi-person-plus"></i> Tambah
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">Tidak ada mahasiswa yang sesuai kriteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-2">
                    <span className="small text-muted">Halaman {availablePage} dari {Math.max(1, Math.ceil(filteredAvailable.length / itemsPerPage))}</span>
                    <div className="btn-group">
                        <button className="btn btn-sm btn-outline-secondary" disabled={availablePage === 1} onClick={() => setAvailablePage(p => p - 1)}>Prev</button>
                        <button className="btn btn-sm btn-outline-secondary" disabled={availablePage >= Math.ceil(filteredAvailable.length / itemsPerPage)} onClick={() => setAvailablePage(p => p + 1)}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManajemenMahasiswaPraktikum;
