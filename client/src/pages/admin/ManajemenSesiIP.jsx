import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManajemenSesiIP = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SESSIONS'); // 'SESSIONS' | 'BANNED'

  // Modal State for Ban Action
  const [showBanModal, setShowBanModal] = useState(false);
  const [banForm, setBanForm] = useState({
    ip_address: '',
    reason: 'Upaya akses mencurigakan atau pelanggaran tata tertib.',
    durationMinutes: '60',
    is_permanent: false
  });
  const [submittingBan, setSubmittingBan] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSessions, resBanned] = await Promise.all([
        api.get('/api/admin/active-sessions'),
        api.get('/api/admin/banned-ips')
      ]);
      setActiveSessions(resSessions.data.activeSessions || []);
      setBannedIps(resBanned.data.bannedIps || []);
    } catch (err) {
      console.error("Error fetching session/IP data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBanModal = (ipAddress = '') => {
    setBanForm({
      ip_address: ipAddress,
      reason: 'Upaya akses mencurigakan atau pelanggaran tata tertib.',
      durationMinutes: '60',
      is_permanent: false
    });
    setShowBanModal(true);
  };

  const handleBanSubmit = async (e) => {
    e.preventDefault();
    if (!banForm.ip_address) return alert("Alamat IP tidak boleh kosong.");

    try {
      setSubmittingBan(true);
      await api.post('/api/admin/ban-ip', {
        ip_address: banForm.ip_address,
        reason: banForm.reason,
        durationMinutes: banForm.is_permanent ? 0 : parseInt(banForm.durationMinutes),
        is_permanent: banForm.is_permanent
      });
      setShowBanModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memblokir alamat IP.");
    } finally {
      setSubmittingBan(false);
    }
  };

  const handleUnban = async (ipAddress) => {
    if (!window.confirm(`Yakin ingin membuka pemblokiran (unban) untuk IP ${ipAddress}?`)) return;

    try {
      await api.post('/api/admin/unban-ip', { ip_address: ipAddress });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuka pemblokiran.");
    }
  };

  const formatUserAgent = (ua) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome')) return 'Google Chrome';
    if (ua.includes('Firefox')) return 'Mozilla Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Apple Safari';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    return ua.slice(0, 30) + '...';
  };

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-shield-slash me-2 text-danger"></i>Keamanan Sesi & Pemblokiran IP
          </h2>
          <p className="text-muted mb-0">Pantau sesi pengguna aktif berdasarkan IP dan kelola pemblokiran sementara/permanen.</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => openBanModal()} className="btn btn-danger rounded-pill px-3 py-1.5 btn-sm fw-bold">
            <i className="bi bi-slash-circle me-1"></i> Blokir IP Manual
          </button>
          <button onClick={fetchData} className="btn btn-outline-secondary rounded-pill px-3 py-1.5 btn-sm fw-bold">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      {/* METRIC STATS ROW */}
      <div className="row g-3 mb-4">
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 h-100">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-uppercase fw-bold text-primary">Sesi IP Aktif (60 Min)</span>
              <i className="bi bi-hdd-network fs-4 text-primary opacity-75"></i>
            </div>
            <h3 className="fw-bold text-dark mb-0">{activeSessions.length}</h3>
            <small className="text-muted">Perangkat terhubung</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 h-100">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-uppercase fw-bold text-danger">IP Diblokir</span>
              <i className="bi bi-slash-circle fs-4 text-danger opacity-75"></i>
            </div>
            <h3 className="fw-bold text-dark mb-0">{bannedIps.length}</h3>
            <small className="text-muted">Alamat IP ter-blacklist</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 h-100">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-uppercase fw-bold text-success">Proteksi Middleware</span>
              <i className="bi bi-shield-check fs-4 text-success opacity-75"></i>
            </div>
            <h5 className="fw-bold text-success mb-0">Aktif & Real-time</h5>
            <small className="text-muted">Enforcement otomatis via HTTP 403</small>
          </div>
        </div>

      </div>

      {/* MAIN TAB CONTENT CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        
        {/* TAB NAVIGATION HEADER */}
        <div className="card-header bg-white border-bottom p-3">
          <div className="nav nav-pills gap-2">
            <button
              onClick={() => setActiveTab('SESSIONS')}
              className={`nav-link rounded-pill px-4 fw-bold btn-sm ${activeTab === 'SESSIONS' ? 'active bg-primary' : 'text-muted'}`}
            >
              <i className="bi bi-broadcast me-2"></i>Sesi IP Aktif ({activeSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('BANNED')}
              className={`nav-link rounded-pill px-4 fw-bold btn-sm ${activeTab === 'BANNED' ? 'active bg-danger' : 'text-muted'}`}
            >
              <i className="bi bi-slash-circle me-2"></i>Daftar IP Diblokir ({bannedIps.length})
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 small">Memuat data sesi dan keamanan IP...</p>
            </div>
          ) : activeTab === 'SESSIONS' ? (
            
            /* ACTIVE SESSIONS TABLE */
            activeSessions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-hdd-network fs-1 d-block mb-2 text-secondary"></i>
                <h6 className="fw-bold">Belum Ada Sesi IP Aktif</h6>
                <p className="small mb-0">Tidak ada pengguna aktif dalam 60 menit terakhir.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light border-bottom">
                    <tr>
                      <th className="ps-4 py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Alamat IP</th>
                      <th className="py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Pengguna / Email</th>
                      <th className="py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Role</th>
                      <th className="py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Perangkat / Browser</th>
                      <th className="py-3 fw-bold text-muted text-uppercase text-center" style={{ fontSize: '0.72rem' }}>Terakhir Aktif</th>
                      <th className="pe-4 py-3 fw-bold text-muted text-uppercase text-end" style={{ fontSize: '0.72rem' }}>Aksi Block</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.map((sess) => (
                      <tr key={sess.id}>
                        
                        {/* IP Address */}
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark font-monospace d-flex align-items-center gap-2">
                            <i className="bi bi-laptop text-primary"></i>
                            <span>{sess.ip_address}</span>
                          </div>
                        </td>

                        {/* User Details */}
                        <td className="py-3">
                          <div className="fw-bold text-dark">{sess.user_name}</div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                            {sess.user_email} {sess.user_nim !== '-' ? `• NIM: ${sess.user_nim}` : ''}
                          </small>
                        </td>

                        {/* Roles */}
                        <td className="py-3">
                          {sess.user_roles.map((r, i) => (
                            <span key={i} className="badge bg-secondary bg-opacity-25 text-dark me-1 fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                              {r}
                            </span>
                          ))}
                        </td>

                        {/* User Agent */}
                        <td className="py-3 text-muted">
                          <span title={sess.user_agent}>{formatUserAgent(sess.user_agent)}</span>
                        </td>

                        {/* Last Active */}
                        <td className="py-3 text-center text-muted" style={{ fontSize: '0.78rem' }}>
                          {new Date(sess.last_active).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>

                        {/* Actions */}
                        <td className="pe-4 py-3 text-end">
                          {sess.is_banned ? (
                            <span className="badge bg-danger text-white rounded-pill px-3 py-1.5 fw-bold">
                              <i className="bi bi-lock-fill me-1"></i>Diblokir
                            </span>
                          ) : (
                            <button
                              onClick={() => openBanModal(sess.ip_address)}
                              className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-bold"
                              style={{ fontSize: '0.78rem' }}
                            >
                              <i className="bi bi-slash-circle me-1"></i>Blokir IP
                            </button>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          ) : (

            /* BANNED IPS TABLE */
            bannedIps.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-shield-check fs-1 d-block mb-2 text-success"></i>
                <h6 className="fw-bold">Tidak Ada IP Yang Diblokir</h6>
                <p className="small mb-0">Semua IP memiliki akses normal ke sistem.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light border-bottom">
                    <tr>
                      <th className="ps-4 py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Alamat IP Diblokir</th>
                      <th className="py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Alasan Pemblokiran</th>
                      <th className="py-3 fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>Diblokir Oleh</th>
                      <th className="py-3 fw-bold text-muted text-uppercase text-center" style={{ fontSize: '0.72rem' }}>Status Masa Berlaku</th>
                      <th className="pe-4 py-3 fw-bold text-muted text-uppercase text-end" style={{ fontSize: '0.72rem' }}>Aksi Unban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedIps.map((b) => (
                      <tr key={b._id}>
                        
                        {/* IP Address */}
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-danger font-monospace">
                            <i className="bi bi-shield-x me-1.5"></i>{b.ip_address}
                          </div>
                        </td>

                        {/* Reason */}
                        <td className="py-3 text-dark fw-bold">
                          {b.reason}
                        </td>

                        {/* Banned By */}
                        <td className="py-3 text-muted">
                          {b.banned_by_name || 'Admin'}
                        </td>

                        {/* Expiration Status */}
                        <td className="py-3 text-center">
                          {b.is_permanent || !b.expires_at ? (
                            <span className="badge bg-danger rounded-pill px-2.5 py-1 fw-bold">
                              Permanen
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1 fw-bold" title={`Hingga: ${new Date(b.expires_at).toLocaleString('id-ID')}`}>
                              Berakhir: {new Date(b.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </td>

                        {/* Unban Action */}
                        <td className="pe-4 py-3 text-end">
                          <button
                            onClick={() => handleUnban(b.ip_address)}
                            className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <i className="bi bi-check-circle me-1"></i>Buka Pemblokiran (Unban)
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          )}
        </div>
      </div>

      {/* BAN IP MODAL */}
      {showBanModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleBanSubmit}>
                
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold text-danger">
                    <i className="bi bi-slash-circle me-2"></i>Pemblokiran Alamat IP
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowBanModal(false)}></button>
                </div>

                <div className="modal-body py-3">
                  
                  {/* IP Address Input */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Alamat IP Target</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 192.168.1.50"
                      value={banForm.ip_address}
                      onChange={(e) => setBanForm({ ...banForm, ip_address: e.target.value })}
                      className="form-control form-control-sm rounded-pill px-3 font-monospace fw-bold"
                    />
                  </div>

                  {/* Reason Input */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Alasan Pemblokiran</label>
                    <textarea
                      rows="2"
                      required
                      value={banForm.reason}
                      onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                      className="form-control form-control-sm rounded-3 p-2.5"
                    ></textarea>
                  </div>

                  {/* Duration Options */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Durasi Pemblokiran</label>
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="permanentCheck"
                        checked={banForm.is_permanent}
                        onChange={(e) => setBanForm({ ...banForm, is_permanent: e.target.checked })}
                      />
                      <label className="form-check-input-label fw-bold text-danger ms-1" htmlFor="permanentCheck">
                        Pemblokiran Permanen (Tanpa Batas Waktu)
                      </label>
                    </div>

                    {!banForm.is_permanent && (
                      <select
                        value={banForm.durationMinutes}
                        onChange={(e) => setBanForm({ ...banForm, durationMinutes: e.target.value })}
                        className="form-select form-select-sm rounded-pill px-3 fw-bold"
                      >
                        <option value="15">15 Menit</option>
                        <option value="60">1 Jam</option>
                        <option value="1440">24 Jam (1 Hari)</option>
                        <option value="4320">3 Hari</option>
                        <option value="10080">7 Hari</option>
                      </select>
                    )}
                  </div>

                  <div className="alert alert-warning small py-2 px-3 rounded-3 mb-0" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-shield-exclamation me-1"></i>Sistem secara otomatis mencegah pemblokiran pada IP lokal admin.
                  </div>

                </div>

                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4 btn-sm fw-bold" onClick={() => setShowBanModal(false)}>
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBan}
                    className="btn btn-danger rounded-pill px-4 btn-sm fw-bold d-inline-flex align-items-center gap-1"
                  >
                    {submittingBan ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-slash-circle"></i>
                        <span>Terapkan Pemblokiran</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManajemenSesiIP;
