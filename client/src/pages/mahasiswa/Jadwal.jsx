import React from 'react';

const Jadwal = () => {
  // Simulasi Data Jadwal (Nanti diambil dari Database)
  const jadwalData = [
    { 
      id: 1, 
      sesi: 'Sesi 1', 
      tanggal: 'Senin, 10 Okt 2025', 
      waktu: '08:00 - 10:00', 
      ruang: 'Lab 2' 
    },
    { 
      id: 2, 
      sesi: 'Sesi 2', 
      tanggal: 'Senin, 17 Okt 2025', 
      waktu: '08:00 - 10:00', 
      ruang: 'Lab 2' 
    },
  ];

  return (
    <div className="container-fluid">
      {/* Judul Halaman */}
      <h2 className="fw-bold text-primary mb-4">Jadwal Praktikum Saya</h2>
      
      {/* Tabel Jadwal */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Sesi</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Ruangan</th>
                </tr>
              </thead>
              <tbody>
                {/* Looping Data */}
                {jadwalData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sesi}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.waktu}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {item.ruang}
                      </span>
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

export default Jadwal;