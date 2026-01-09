import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed or use your api instance

const Dashboard = () => {
  // 1. Setup State to store the data
  const [stats, setStats] = useState({
    totalAsdos: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data on Component Mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Adjust URL if your server runs on a different port (e.g., localhost:5000)
        const response = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats({
          totalAsdos: response.data.totalAsdos,
          pending: response.data.pendingVerifikasi
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <h2 className="fw-bold text-dark mb-4">Admin Dashboard</h2>

      <div className="row">
        
        {/* Kartu 1: Total Asdos */}
        <div className="col-md-4 mb-3">
          <div className="card p-3 bg-primary text-white shadow-sm border-0">
            <h5>Total Asdos</h5>
            <h2 className="fw-bold">
              {loading ? "..." : stats.totalAsdos}
            </h2>
          </div>
        </div>

        {/* Kartu 2: Menunggu Verifikasi */}
        <div className="col-md-4 mb-3">
          <div className="card p-3 bg-warning text-dark shadow-sm border-0">
            <h5>Menunggu Verifikasi</h5>
            <h2 className="fw-bold">
              {loading ? "..." : stats.pending}
            </h2>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;