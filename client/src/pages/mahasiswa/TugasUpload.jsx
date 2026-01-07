import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const TugasUpload = () => {
    const [searchParams] = useSearchParams();
    const taskId = searchParams.get('id');
    const navigate = useNavigate();

    // 1. State untuk Data Tugas (Simulasi Database)
    const [taskData, setTaskData] = useState(null);

    // 2. State untuk Form Upload
    const [file, setFile] = useState(null);
    const [catatan, setCatatan] = useState("");

    // 3. Effect: Load data berdasarkan ID saat halaman dibuka
    useEffect(() => {
        // Ceritanya ini ambil data dari Backend
        if (taskId === '1') {
            setTaskData({
                id: 1,
                judul: "Tugas 1: Analisis Model Bisnis",
                deadline: "12 Oktober 2025, 23:59",
                instruksi: "Buatlah analisis SWOT dari perusahaan Tokopedia. Jelaskan Strength, Weakness, Opportunity, dan Threat mereka dalam 5 tahun terakhir.",
                status: "Pending", // Belum dikumpulkan
                nilai: null
            });
        } else if (taskId === '2') {
            setTaskData({
                id: 2,
                judul: "Tugas 2: Landing Page HTML",
                deadline: "20 Oktober 2025, 23:59",
                instruksi: "Membuat struktur landing page.",
                status: "Graded", // Sudah dinilai
                nilai: 85,
                feedback: "Codingan rapi, mantap!",
                fileUploaded: "landing_page_daffa.zip"
            });
        }
    }, [taskId]);

    // 4. Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            alert("Mohon pilih file terlebih dahulu!");
            return;
        }
        
        // Simulasi Upload
        alert(`Tugas "${taskData.judul}" berhasil dikumpulkan!`);
        navigate('/mahasiswa/tugas'); // Balik ke menu list
    };

    // Jika data belum loading
    if (!taskData) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="container-fluid">
            {/* Tombol Kembali */}
            <div className="mb-3">
                <Link to="/mahasiswa/tugas" className="text-decoration-none text-muted fw-bold">
                    <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar Tugas
                </Link>
            </div>
            
            <div className="row">
                {/* KOLOM KIRI: INFO SOAL */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <h3 className="fw-bold text-primary">{taskData.judul}</h3>
                            
                            {/* Badge Deadline */}
                            <div className={`badge mb-3 ${taskData.status === 'Graded' ? 'bg-success' : 'bg-danger'}`}>
                                <i className="bi bi-clock me-1"></i> Deadline: {taskData.deadline}
                            </div>
                            
                            <hr />
                            
                            <h6 className="fw-bold">Instruksi:</h6>
                            <p>{taskData.instruksi}</p>
                            <p>Format file: <strong>.PDF / .ZIP</strong></p>
                            
                            {/* Tombol Download Soal (Dummy) */}
                            <div className="mt-4 p-3 bg-light rounded border border-dashed d-flex align-items-center">
                                <i className="bi bi-file-earmark-arrow-down fs-3 me-3 text-primary"></i>
                                <div>
                                    <h6 className="mb-0 fw-bold">File Soal Pendukung</h6>
                                    <a href="#" className="text-decoration-none small">Download Soal.pdf</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN: FORM PENGUMPULAN / HASIL NILAI */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3 fw-bold border-bottom">
                            Submission (Pengumpulan)
                        </div>
                        
                        <div className="card-body p-4">
                            
                            {/* KONDISI 1: JIKA SUDAH DINILAI (Show Nilai) */}
                            {taskData.status === 'Graded' ? (
                                <div className="text-center py-3">
                                    <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                                    <h5 className="fw-bold">Tugas Selesai Dinilai</h5>
                                    <div className="display-4 fw-bold text-success my-3">{taskData.nilai}/100</div>
                                    
                                    <div className="alert alert-light border text-start">
                                        <strong>Feedback Dosen:</strong> <br/>
                                        "{taskData.feedback}"
                                    </div>

                                    <div className="text-muted small text-start mt-3">
                                        File terupload: <i className="bi bi-file-earmark me-1"></i> {taskData.fileUploaded}
                                    </div>
                                </div>
                            ) : (
                                /* KONDISI 2: JIKA BELUM (Show Form Upload) */
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Upload Jawaban</label>
                                        <div className="p-3 bg-light border border-dashed rounded text-center">
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                onChange={(e) => setFile(e.target.files[0])}
                                                required 
                                            />
                                            <small className="text-muted d-block mt-2">Max size: 5MB</small>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted">Catatan (Opsional)</label>
                                        <textarea 
                                            className="form-control bg-light border-0" 
                                            rows="3"
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            placeholder="Pesan untuk asdos..."
                                        ></textarea>
                                    </div>
                                    
                                    <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm py-2">
                                        <i className="bi bi-upload me-2"></i> Submit Tugas
                                    </button>
                                </form>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TugasUpload;