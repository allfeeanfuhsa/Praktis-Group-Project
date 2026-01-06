import React from 'react';
import { Link } from 'react-router-dom';

const Materi = () => {
    // Simulasi Data Materi (Nanti dari Database)
    const materiList = [
        {
            id: 1,
            judul: "Modul 1.pdf",
            size: "2.4 MB",
            deskripsi: "Pengenalan dasar E-Business.",
            tipe: "pdf" // Bisa digunakan untuk menentukan warna icon nanti
        },
        // Contoh data kedua (biar terlihat grid-nya)
        {
            id: 2,
            judul: "Panduan Instalasi.pdf",
            size: "1.1 MB",
            deskripsi: "Cara setup environment praktikum.",
            tipe: "pdf"
        }
    ];

    return (
        <>
            {/* Header & Tombol Upload */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">Bank Materi</h3>
                <Link to="/asdos/materi/input" className="btn btn-primary shadow-sm">
                    <i className="bi bi-upload me-2"></i>Upload
                </Link>
            </div>

            {/* Grid Materi */}
            <div className="row g-4">
                {materiList.map((item) => (
                    <div className="col-md-4" key={item.id}>
                        <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    {/* Icon PDF Merah */}
                                    <div className="bg-danger bg-opacity-10 p-3 rounded text-danger me-3">
                                        <i className="bi bi-file-pdf fs-3"></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0">{item.judul}</h6>
                                        <small className="text-muted">{item.size}</small>
                                    </div>
                                </div>
                                <p className="small text-muted mb-3">{item.deskripsi}</p>
                                
                                {/* Tombol Download (Dummy) */}
                                <button className="btn btn-sm btn-outline-primary w-100">
                                    <i className="bi bi-download me-2"></i>Download
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Materi;