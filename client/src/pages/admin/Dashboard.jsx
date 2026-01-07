import React from 'react';

const Dashboard = () => {
  return (
    <>
      {/* Judul Halaman */}
      <h2 className="fw-bold text-dark mb-4">Admin Dashboard</h2>

      {/* Baris Kartu Statistik */}
      <div className="row">
        
        {/* Kartu 1: Total Asdos */}
        <div className="col-md-4 mb-3">
          <div className="card p-3 bg-primary text-white shadow-sm border-0">
            <h5>Total Asdos</h5>
            <h2 className="fw-bold">12</h2>
          </div>
        </div>

        {/* Kartu 2: Menunggu Verifikasi */}
        <div className="col-md-4 mb-3">
          <div className="card p-3 bg-warning text-dark shadow-sm border-0">
            <h5>Menunggu Verifikasi</h5>
            <h2 className="fw-bold">3</h2>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;