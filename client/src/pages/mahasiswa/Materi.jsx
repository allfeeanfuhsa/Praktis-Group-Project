import React from 'react';

const Materi = () => {
    // Simulasi Data Materi
    const materiList = [
        {
            id: 1,
            judul: "Modul 1 - Pengenalan E-Business",
            deskripsi: "Konsep dasar, sejarah, dan model bisnis elektronik.",
            tipe: "pdf", // pdf, ppt, doc
            size: "2.4 MB",
            tanggal: "10 Okt 2025"
        },
        {
            id: 2,
            judul: "Slide Presentasi Pertemuan 2",
            deskripsi: "Materi slide tentang strategi pemasaran digital.",
            tipe: "ppt",
            size: "5.1 MB",
            tanggal: "17 Okt 2025"
        },
        {
            id: 3,
            judul: "Panduan Instalasi Tools",
            deskripsi: "Langkah-langkah instalasi VS Code dan XAMPP.",
            tipe: "doc",
            size: "1.2 MB",
            tanggal: "18 Okt 2025"
        }
    ];

    // Helper function untuk menentukan Icon & Warna berdasarkan tipe file
    const getFileIcon = (type) => {
        switch(type) {
            case 'pdf': return { icon: 'bi-file-pdf', color: 'text-danger bg-danger' };
            case 'ppt': return { icon: 'bi-file-earmark-slides', color: 'text-warning bg-warning' };
            case 'doc': return { icon: 'bi-file-earmark-word', color: 'text-primary bg-primary' };
            default: return { icon: 'bi-file-earmark', color: 'text-secondary bg-secondary' };
        }
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-primary mb-0">Materi Praktikum</h2>
                <p className="text-muted small">Download modul dan bahan ajar untuk menunjang kegiatan praktikum.</p>
            </div>

            {/* Grid Materi */}
            <div className="row g-4">
                {materiList.map((item) => {
                    const style = getFileIcon(item.tipe);
                    
                    return (
                        <div className="col-md-6 col-lg-4" key={item.id}>
                            <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                                <div className="card-body">
                                    <div className="d-flex align-items-start mb-3">
                                        {/* Icon File */}
                                        <div className={`p-3 rounded me-3 bg-opacity-10 ${style.color}`}>
                                            <i className={`bi ${style.icon} fs-3`}></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark line-clamp-2">{item.judul}</h6>
                                            <small className="text-muted d-block">{item.size} • {item.tanggal}</small>
                                        </div>
                                    </div>
                                    
                                    <p className="small text-muted mb-4 line-clamp-2">
                                        {item.deskripsi}
                                    </p>
                                    
                                    {/* Tombol Download */}
                                    <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                                        <i className="bi bi-download me-2"></i>Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Materi;