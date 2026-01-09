import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; 

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAsdos: 0,
    totalClasses: 0 // Renamed from 'pending'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/admin/stats');

        setStats({
          totalAsdos: response.data.totalAsdos,
          // Map the new backend field here:
          totalClasses: response.data.totalClasses 
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
            <h5>Total Asdos Aktif</h5>
            <h2 className="fw-bold">
              {loading ? "..." : stats.totalAsdos}
            </h2>
          </div>
        </div>

        {/* Kartu 2: Total Praktikum (REPLACED Pending Verifikasi) */}
        <div className="col-md-4 mb-3">
          <div className="card p-3 bg-warning text-dark shadow-sm border-0">
            <h5>Total Kelas Praktikum</h5>
            <h2 className="fw-bold">
              {loading ? "..." : stats.totalClasses}
            </h2>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;