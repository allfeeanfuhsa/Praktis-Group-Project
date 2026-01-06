import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Penilaian = () => {
  // Simulasi Data Mahasiswa & Status Tugas
  const [mahasiswaList, setMahasiswaList] = useState([
    {
      id: 1,
      nama: "Jefri Nichol",
      nim: "1232001009",
      status: "Submitted", // Submitted / Missing
      nilai: 85, // Nilai awal
      feedback: ""
    },
    {
      id: 2,
      nama: "Ahmad Dani",
      nim: "1232001010",
      status: "Missing",
      nilai: "",
      feedback: ""
    }
  ]);

  // Fungsi saat nilai/feedback diketik
  const handleInputChange = (id, field, value) => {
    // Update data di state berdasarkan ID mahasiswa
    setMahasiswaList(prevList => 
      prevList.map(mhs => 
        mhs.id === id ? { ...mhs, [field]: value } : mhs
      )
    );
  };

  // Fungsi simpan per baris
  const handleSave = (mahasiswa) => {
    console.log("Menyimpan nilai untuk:", mahasiswa.nama);
    console.log("Nilai:", mahasiswa.nilai);
    console.log("Feedback:", mahasiswa.feedback);
    
    alert(`Nilai untuk ${mahasiswa.nama} berhasil disimpan!`);
  };

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/asdos/tugas" className="text-decoration-none text-muted small fw-bold">
            <i className="bi bi-arrow-left"></i> Kembali ke Daftar Tugas
          </Link>
          <h2 className="fw-bold text-primary mt-1">Penilaian: Tugas 1</h2>
        </div>
        <div className="badge bg-warning text-dark p-2 shadow-sm">
            <i className="bi bi-clock me-1"></i> Deadline: 12 Okt 2025
        </div>
      </div>

      {/* TABEL PENILAIAN */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mahasiswa</th>
                  <th>Status</th>
                  <th>File Tugas</th>
                  <th style={{ width: '120px' }}>Nilai (0-100)</th>
                  <th>Feedback</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mahasiswaList.map((mhs) => (
                  <tr key={mhs.id}>
                    {/* Kolom Nama */}
                    <td>
                      <div className="fw-bold">{mhs.nama}</div>
                      <small className="text-muted">{mhs.nim}</small>
                    </td>
                    
                    {/* Kolom Status Badge */}
                    <td>
                        {mhs.status === 'Submitted' ? (
                            <span className="badge bg-success">Submitted</span>
                        ) : (
                            <span className="badge bg-danger">Missing</span>
                        )}
                    </td>

                    {/* Kolom Download File */}
                    <td>
                        {mhs.status === 'Submitted' ? (
                            <button className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-download me-1"></i> Download
                            </button>
                        ) : (
                            <span className="text-muted small">-</span>
                        )}
                    </td>

                    {/* Kolom Input Nilai */}
                    <td>
                        <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            value={mhs.nilai}
                            onChange={(e) => handleInputChange(mhs.id, 'nilai', e.target.value)}
                            disabled={mhs.status === 'Missing'} // Disable jika belum kumpul
                            min="0"
                            max="100"
                        />
                    </td>

                    {/* Kolom Feedback */}
                    <td>
                        <textarea 
                            className="form-control form-control-sm" 
                            rows="1" 
                            placeholder={mhs.status === 'Missing' ? '-' : 'Beri feedback...'}
                            value={mhs.feedback}
                            onChange={(e) => handleInputChange(mhs.id, 'feedback', e.target.value)}
                            disabled={mhs.status === 'Missing'}
                        ></textarea>
                    </td>

                    {/* Kolom Tombol Simpan */}
                    <td>
                        <button 
                            className={`btn btn-sm ${mhs.status === 'Submitted' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleSave(mhs)}
                            disabled={mhs.status === 'Missing'}
                            title="Simpan Nilai"
                        >
                            <i className="bi bi-check-lg"></i>
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

export default Penilaian;