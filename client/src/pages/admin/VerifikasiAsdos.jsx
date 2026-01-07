import React from 'react';

const VerifikasiAsdos = () => {
    // Simulasi Data (Nanti data ini diambil dari Database/API)
    const pendaftar = [
        { id: 1, nama: 'Daffa Ibnu', nim: '1232001033' },
        // Anda bisa tambah data dummy lain di sini jika mau tes
        // { id: 2, nama: 'Mahasiswa Lain', nim: '123456789' },
    ];

    return (
        <>
            <h3 className="fw-bold mb-3">Verifikasi Pendaftaran Asdos</h3>
            
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nama Calon</th>
                                    <th>NIM</th>
                                    <th>Berkas</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Kita gunakan fungsi .map() untuk meloop data */}
                                {pendaftar.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nama}</td>
                                        <td>{item.nim}</td>
                                        <td>
                                            <a href="#" className="btn btn-sm btn-outline-primary">
                                                Lihat CV
                                            </a>
                                        </td>
                                        <td>
                                            <button className="btn btn-success btn-sm me-2">
                                                <i className="bi bi-check-lg me-1"></i> Terima
                                            </button>
                                            <button className="btn btn-danger btn-sm">
                                                <i className="bi bi-x-lg me-1"></i> Tolak
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifikasiAsdos;