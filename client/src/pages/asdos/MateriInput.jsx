import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MateriInput = () => {
    const navigate = useNavigate();

    // 1. State untuk Form Data
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        file: null // Untuk menyimpan objek file
    });

    // 2. Handle Input Teks (Judul & Deskripsi)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 3. Handle Input File
    const handleFileChange = (e) => {
        // Mengambil file pertama yang dipilih user
        setFormData({ ...formData, file: e.target.files[0] });
    };

    // 4. Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasi Sederhana
        if (!formData.file) {
            alert("Harap pilih file materi terlebih dahulu!");
            return;
        }

        // Simulasi Upload
        alert(`Materi "${formData.judul}" berhasil diupload!`);
        
        // Redirect kembali ke halaman daftar materi
        navigate('/asdos/materi');
    };

    return (
        <div className="container-fluid">
            {/* Tombol Kembali */}
            <div className="mb-4">
                <Link to="/asdos/materi" className="text-decoration-none text-muted fw-bold">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Daftar Materi
                </Link>
            </div>

            <div className="row justify-content-center">
                {/* KOLOM KIRI: FORM */}
                <div className="col-md-8 mb-4">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-cloud-upload me-2"></i>Upload Materi Baru
                            </h5>
                        </div>
                        
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Input Judul */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-uppercase text-muted">Judul Materi</label>
                                    <input 
                                        type="text" 
                                        name="judul"
                                        className="form-control form-control-lg bg-light border-0" 
                                        placeholder="Contoh: Modul 1 - Pengenalan E-Business" 
                                        value={formData.judul}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                {/* Input Deskripsi */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-uppercase text-muted">Deskripsi / Instruksi</label>
                                    <textarea 
                                        name="deskripsi"
                                        className="form-control bg-light border-0" 
                                        rows="5" 
                                        placeholder="Tuliskan deskripsi singkat mengenai materi ini..."
                                        value={formData.deskripsi}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                {/* Input File */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-uppercase text-muted">File Modul (PDF/PPT)</label>
                                    <div className="p-4 bg-light border border-2 border-dashed rounded-3 text-center">
                                        <i className="bi bi-file-earmark-arrow-up fs-1 text-primary mb-2"></i>
                                        <p className="small text-muted mb-2">Klik tombol di bawah untuk memilih file</p>
                                        
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            accept=".pdf,.ppt,.pptx,.doc,.docx" 
                                            onChange={handleFileChange}
                                            required 
                                        />
                                        
                                        <div className="form-text mt-2">Maksimal ukuran file: 5 MB</div>
                                        
                                        {/* Feedback Nama File yang Dipilih */}
                                        {formData.file && (
                                            <div className="mt-2 text-success fw-bold small">
                                                <i className="bi bi-check-circle me-1"></i> 
                                                Terpilih: {formData.file.name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="d-flex gap-2 justify-content-end mt-5">
                                    <Link to="/asdos/materi" className="btn btn-light px-4 fw-bold text-secondary">
                                        Batal
                                    </Link>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                                        <i className="bi bi-save me-2"></i>Simpan Materi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                {/* KOLOM KANAN: TIPS (INFO SIDEBAR) */}
                <div className="col-md-4">
                    <div className="alert alert-info border-0 shadow-sm d-flex align-items-start" role="alert">
                        <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                        <div>
                            <strong>Tips Upload:</strong>
                            <ul className="mb-0 ps-3 small mt-1">
                                <li>Pastikan format file PDF agar mudah dibaca mahasiswa.</li>
                                <li>Berikan judul yang jelas sesuai pertemuan.</li>
                                <li>Jika file terlalu besar, compress terlebih dahulu.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MateriInput;