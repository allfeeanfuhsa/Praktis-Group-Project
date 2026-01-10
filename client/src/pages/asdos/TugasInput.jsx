import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const TugasInput = () => {
    const navigate = useNavigate();
    
    // 1. Hook untuk membaca parameter URL (?id=...)
    const [searchParams] = useSearchParams();
    const taskId = searchParams.get('id'); // Ambil nilai 'id'
    const isEditMode = !!taskId; // True jika id ada, False jika tidak

    // 2. State Form Data
    const [formData, setFormData] = useState({
        judul: '',
        deskripsi: '',
        deadline: '',
        file: null
    });

    // 3. EFFECT: Cek Mode Edit saat halaman dimuat
    useEffect(() => {
        if (isEditMode) {
            // Simulasi: Jika mode edit, isi form dengan data dummy (seperti di PHP Anda)
            setFormData({
                judul: 'Analisis SWOT',
                deskripsi: 'Mahasiswa mengumpulkan file PDF analisis.',
                deadline: '2025-10-25T23:59', // Format datetime-local harus YYYY-MM-DDTHH:MM
                file: null
            });
        }
    }, [isEditMode]);

    // 4. Handle Perubahan Input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    // 5. Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Tentukan pesan sukses berdasarkan mode
        const pesan = isEditMode ? "Perubahan berhasil disimpan!" : "Tugas berhasil dipublikasikan!";
        
        alert(pesan);
        
        navigate('/asdos/tugas'); // Kembali ke daftar tugas
    };

    return (
        <div className="container-fluid">
            {/* Tombol Kembali */}
            <div className="mb-3">
                <Link to="/asdos/tugas" className="text-decoration-none text-muted fw-bold">
                    <i className="bi bi-arrow-left me-1"></i> Kembali
                </Link>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white py-3 border-bottom-0">
                    {/* Judul Dinamis */}
                    <h5 className="mb-0 fw-bold text-dark">
                        {isEditMode ? 'Edit Tugas' : 'Buat Tugas Baru'}
                    </h5>
                </div>
                
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        
                        {/* Input Judul */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">Judul Tugas</label>
                            <input 
                                type="text" 
                                name="judul"
                                className="form-control bg-light border-0" 
                                placeholder="Contoh: Analisis SWOT" 
                                value={formData.judul}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        {/* Input Deskripsi */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">Instruksi / Deskripsi Soal</label>
                            <textarea 
                                name="deskripsi"
                                className="form-control bg-light border-0" 
                                rows="5" 
                                placeholder="Jelaskan detail tugas di sini..."
                                value={formData.deskripsi}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="row">
                            {/* Input Deadline */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-muted">Deadline (Tenggat Waktu)</label>
                                <input 
                                    type="datetime-local" 
                                    name="deadline"
                                    className="form-control bg-light border-0" 
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            
                            {/* Input File */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-muted">File Soal (Opsional)</label>
                                <input 
                                    type="file" 
                                    className="form-control bg-light border-0" 
                                    onChange={handleFileChange}
                                />
                                <small className="text-muted">Upload PDF/DOCX jika soal berupa file.</small>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Link to="/asdos/tugas" className="btn btn-light border fw-bold text-secondary">
                                Batal
                            </Link>
                            <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                                {/* Teks Tombol Dinamis */}
                                {isEditMode ? 'Simpan Perubahan' : 'Publikasikan Tugas'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TugasInput;