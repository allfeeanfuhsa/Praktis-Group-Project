import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const JadwalInput = () => {
    const navigate = useNavigate();

    // 1. Siapkan State untuk menampung data formulir
    const [formData, setFormData] = useState({
        matkul: 'E-Business & Web Development', // Default value (Readonly)
        hari: '',
        ruangan: '',
        jamMulai: '',
        jamSelesai: ''
    });

    // 2. Fungsi untuk menangani perubahan input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // 3. Fungsi saat tombol Simpan ditekan
    const handleSubmit = (e) => {
        e.preventDefault(); // Mencegah reload halaman
        
        // Di sini nanti logika kirim ke Database/API
        // Simulasi sukses & kembali ke halaman jadwal
        alert("Jadwal Berhasil Disimpan!");
        navigate('/asdos/jadwal'); 
    };

    return (
        <div className="container-fluid">
            {/* Tombol Kembali */}
            <div className="mb-4">
                <Link to="/asdos/jadwal" className="text-decoration-none text-muted fw-bold">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Jadwal
                </Link>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold text-dark">Form Jadwal Praktikum</h5>
                        </div>
                        
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Input Readonly */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">Mata Kuliah</label>
                                    <input 
                                        type="text" 
                                        name="matkul"
                                        className="form-control bg-light border-0 py-2" 
                                        value={formData.matkul} 
                                        readOnly 
                                    />
                                </div>

                                <div className="row">
                                    {/* Select Hari */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label fw-bold small text-muted">Hari</label>
                                        <select 
                                            name="hari"
                                            className="form-select bg-light border-0 py-2"
                                            value={formData.hari}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Pilih Hari...</option>
                                            <option value="Senin">Senin</option>
                                            <option value="Selasa">Selasa</option>
                                            <option value="Rabu">Rabu</option>
                                            <option value="Kamis">Kamis</option>
                                            <option value="Jumat">Jumat</option>
                                            <option value="Sabtu">Sabtu</option>
                                        </select>
                                    </div>
                                    
                                    {/* Select Ruangan */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label fw-bold small text-muted">Ruangan Lab</label>
                                        <select 
                                            name="ruangan"
                                            className="form-select bg-light border-0 py-2"
                                            value={formData.ruangan}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Pilih Ruangan...</option>
                                            <option value="Lab B">Lab B</option>
                                            <option value="Lab C">Lab C</option>
                                            <option value="Lab D">Lab D</option>
                                            <option value="Lab Cisco">Lab Cisco</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    {/* Input Jam Mulai */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label fw-bold small text-muted">Jam Mulai</label>
                                        <input 
                                            type="time" 
                                            name="jamMulai"
                                            className="form-control bg-light border-0 py-2" 
                                            value={formData.jamMulai}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                    
                                    {/* Input Jam Selesai */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label fw-bold small text-muted">Jam Selesai</label>
                                        <input 
                                            type="time" 
                                            name="jamSelesai"
                                            className="form-control bg-light border-0 py-2" 
                                            value={formData.jamSelesai}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="d-flex gap-2 justify-content-end mt-2">
                                    <Link to="/asdos/jadwal" className="btn btn-light border px-4 fw-bold text-secondary">
                                        Batal
                                    </Link>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                                        Simpan Jadwal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JadwalInput;