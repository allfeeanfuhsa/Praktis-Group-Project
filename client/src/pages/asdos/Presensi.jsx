import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const PresensiAsdos = () => {
    const { id_praktikum } = useParams();
    const navigate = useNavigate();

    // Data States
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);

    // UI States
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingSheet, setLoadingSheet] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saved'
    const [error, setError] = useState(null);

    // 1. Fetch Statuses and Sessions
    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            if (!id_praktikum) return;

            try {
                setLoadingSessions(true);
                setError(null);

                // Fetch Statuses & Sessions in parallel
                const [statusRes, sessionRes] = await Promise.all([
                    api.get('/api/attendance/statuses').catch(e => ({ data: [] })),
                    api.get(`/api/content/session/list/${id_praktikum}`).catch(e => ({ data: [] }))
                ]);

                if (isMounted) {
                    setStatuses(statusRes.data || []);
                    const sessionData = sessionRes.data || [];
                    setSessions(sessionData);

                    // Auto-select first session if available
                    if (sessionData.length > 0) {
                        setSelectedSession(sessionData[0].id_pertemuan);
                    }
                }
            } catch (err) {
                console.error("Error fetching initial attendance data:", err);
                if (isMounted) setError("Gagal memuat sesi kelas.");
            } finally {
                if (isMounted) setLoadingSessions(false);
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, [id_praktikum]);

    // 2. Fetch Attendance Sheet when selectedSession changes
    useEffect(() => {
        let isMounted = true;

        const fetchAttendanceSheet = async () => {
            if (!selectedSession) {
                setAttendanceList([]);
                setSessionInfo(null);
                return;
            }

            try {
                setLoadingSheet(true);
                setSaveStatus(null);
                const res = await api.get(`/api/attendance/session/${selectedSession}`);

                if (isMounted) {
                    setSessionInfo(res.data.session || null);
                    if (res.data.statuses && res.data.statuses.length > 0) {
                        setStatuses(res.data.statuses);
                    }

                    // Map attendance list safely
                    const rawAttendance = res.data.attendance || [];
                    const formattedList = rawAttendance.map(item => ({
                        id_user: item.id_user,
                        nama: item.nama,
                        nim: item.nim,
                        id_status: item.presensi?.id_status || null
                    }));

                    setAttendanceList(formattedList);
                }
            } catch (err) {
                console.error("Error fetching attendance sheet:", err);
            } finally {
                if (isMounted) setLoadingSheet(false);
            }
        };

        fetchAttendanceSheet();

        return () => {
            isMounted = false;
        };
    }, [selectedSession]);

    // Status Change Handler
    const handleStatusChange = (userId, newStatusId) => {
        setAttendanceList(prev => prev.map(record =>
            record.id_user === userId ? { ...record, id_status: parseInt(newStatusId) } : record
        ));
        setSaveStatus(null);
    };

    // Mark All Present Shortcut
    const handleMarkAllHadir = () => {
        const hadirStatus = statuses.find(s => s.status.toLowerCase() === 'hadir');
        if (!hadirStatus) return;

        setAttendanceList(prev => prev.map(record => ({
            ...record,
            id_status: hadirStatus.id_status
        })));
        setSaveStatus(null);
    };

    // Helper for matching Alpa/Alfa variations
    const isAlpaStatus = (label) => {
        if (!label) return false;
        const l = label.toLowerCase();
        return l === 'alfa' || l === 'alpa' || l === 'alpha';
    };

    // Save Attendance
    const handleSave = async () => {
        if (!selectedSession || attendanceList.length === 0) return;

        try {
            setSaving(true);
            setSaveStatus(null);

            const defaultAlpaId = statuses.find(s => isAlpaStatus(s.status))?.id_status || 4;

            const payload = {
                records: attendanceList.map(r => ({
                    id_user: r.id_user,
                    id_status: r.id_status || defaultAlpaId
                }))
            };

            await api.post(`/api/attendance/session/${selectedSession}`, payload);

            setSaveStatus('saved');
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        } catch (err) {
            console.error("Error saving attendance:", err);
            alert("Gagal menyimpan presensi.");
        } finally {
            setSaving(false);
        }
    };

    // Stat Calculations
    const totalStudents = attendanceList.length;
    const hadirCount = attendanceList.filter(r => {
        const st = statuses.find(s => s.id_status === r.id_status);
        return st?.status.toLowerCase() === 'hadir';
    }).length;

    const izinCount = attendanceList.filter(r => {
        const st = statuses.find(s => s.id_status === r.id_status);
        return st?.status.toLowerCase() === 'izin' || st?.status.toLowerCase() === 'sakit';
    }).length;

    const alpaCount = attendanceList.filter(r => {
        const st = statuses.find(s => s.id_status === r.id_status);
        return isAlpaStatus(st?.status) || !r.id_status;
    }).length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    if (loadingSessions) {
        return (
            <div className="text-center py-5 text-light">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="opacity-75 mt-3">Memuat modul presensi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card static rounded-4 p-4 text-white text-center">
                <i className="bi bi-exclamation-circle fs-1 d-block mb-3 text-danger"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            {/* HEADER */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
                <button onClick={() => navigate(`/asdos/kelas/${id_praktikum}`)} className="btn btn-light shadow-sm mb-4 fw-bold rounded-pill px-4">
                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Kelas Hub
                </button>
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                    <div>
                        <h3 className="fw-bold text-white mb-2">Manajemen Presensi</h3>
                        <p className="text-light opacity-75 small mb-0">Catat dan pantau kehadiran mahasiswa di setiap sesi pertemuan.</p>
                    </div>
                </div>
            </motion.div>

            {/* SESSION SELECTOR WIDGET */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card static rounded-4 p-4 mb-4">
                <label className="form-label small fw-bold text-light opacity-75 mb-2 text-uppercase tracking-wider">
                    <i className="bi bi-calendar-check me-2"></i>Pilih Sesi Pertemuan
                </label>
                {sessions.length === 0 ? (
                    <div className="text-light opacity-75 small py-2">
                        Belum ada sesi pertemuan. Silakan buat sesi di menu <strong className="text-white">Jadwal</strong>.
                    </div>
                ) : (
                    <select
                        className="form-select form-select-lg bg-dark text-white border-light border-opacity-25 rounded-3 fw-bold shadow-none"
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                    >
                        {sessions.map(s => (
                            <option key={s.id_pertemuan} value={s.id_pertemuan} className="bg-dark text-white">
                                Sesi {s.sesi_ke} — {new Date(s.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                )}
            </motion.div>

            {/* STATS BAR (WHEN SESSION IS SELECTED) */}
            {selectedSession && !loadingSheet && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
                            <div className="bg-primary bg-opacity-25 p-3 rounded-4 text-white me-3">
                                <i className="bi bi-people fs-4"></i>
                            </div>
                            <div>
                                <small className="text-light opacity-75 d-block">Total Mahasiswa</small>
                                <h4 className="fw-bold text-white mb-0">{totalStudents}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
                            <div className="bg-success bg-opacity-25 p-3 rounded-white me-3">
                                <i className="bi bi-person-check fs-4 text-success"></i>
                            </div>
                            <div>
                                <small className="text-light opacity-75 d-block">Hadir</small>
                                <h4 className="fw-bold text-white mb-0">{hadirCount}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
                            <div className="bg-warning bg-opacity-25 p-3 rounded-white me-3">
                                <i className="bi bi-exclamation-circle fs-4 text-warning"></i>
                            </div>
                            <div>
                                <small className="text-light opacity-75 d-block">Sakit / Izin</small>
                                <h4 className="fw-bold text-white mb-0">{izinCount}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="glass-card static rounded-4 p-3 d-flex align-items-center">
                            <div className="bg-danger bg-opacity-25 p-3 rounded-white me-3">
                                <i className="bi bi-person-x fs-4 text-danger"></i>
                            </div>
                            <div>
                                <small className="text-light opacity-75 d-block">Alpa / Belum</small>
                                <h4 className="fw-bold text-white mb-0">{alpaCount}</h4>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ATTENDANCE SHEET */}
            {selectedSession && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card static rounded-4 overflow-hidden p-0 mb-4">
                    {/* Sheet Header */}
                    <div className="p-4 border-bottom border-light border-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div>
                            <h5 className="fw-bold text-white mb-1">
                                Lembar Presensi — {sessionInfo ? `Sesi ${sessionInfo.sesi_ke}` : 'Daftar Kehadiran'}
                            </h5>
                            <small className="text-light opacity-75">
                                Klik status di tiap baris untuk memperbarui kehadiran mahasiswa.
                            </small>
                        </div>

                        <div className="d-flex gap-2 align-items-center">
                            <button
                                type="button"
                                className="btn btn-outline-light rounded-pill px-3 btn-sm fw-bold"
                                onClick={handleMarkAllHadir}
                                disabled={attendanceList.length === 0 || saving}
                                title="Tandai semua mahasiswa sebagai Hadir"
                            >
                                <i className="bi bi-check-all me-1"></i> Tandai semua Hadir
                            </button>

                            <button
                                type="button"
                                className={`btn ${saveStatus === 'saved' ? 'btn-success' : 'btn-primary'} rounded-pill px-4 btn-sm fw-bold transition-all`}
                                onClick={handleSave}
                                disabled={saving || attendanceList.length === 0}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...
                                    </>
                                ) : saveStatus === 'saved' ? (
                                    <>
                                        <i className="bi bi-check2 me-1"></i> Presensi Tersimpan
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save me-1"></i> Simpan Presensi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sheet Content */}
                    <div className="table-responsive">
                        {loadingSheet ? (
                            <div className="text-center py-5 text-light">
                                <div className="spinner-border text-light" role="status"></div>
                                <p className="opacity-75 mt-3 small">Memuat daftar mahasiswa...</p>
                            </div>
                        ) : attendanceList.length === 0 ? (
                            <div className="text-center py-5 text-light opacity-50">
                                <i className="bi bi-people fs-1 d-block mb-3 opacity-50"></i>
                                Belum ada mahasiswa terdaftar di kelas ini.
                            </div>
                        ) : (
                            <table className="table table-dark table-hover align-middle mb-0 bg-transparent">
                                <thead>
                                    <tr className="border-bottom border-light border-opacity-10 text-uppercase tracking-wider small text-light opacity-75">
                                        <th className="px-4 py-3 bg-transparent">Mahasiswa</th>
                                        <th className="py-3 bg-transparent">NIM</th>
                                        <th className="px-4 py-3 bg-transparent text-center">Status Kehadiran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.map((record) => (
                                        <motion.tr variants={itemVariants} key={record.id_user} className="border-bottom border-light border-opacity-10">
                                            <td className="px-4 bg-transparent fw-bold text-white">
                                                {record.nama || 'Mahasiswa'}
                                            </td>
                                            <td className="bg-transparent text-light opacity-75 small">
                                                {record.nim || '-'}
                                            </td>
                                            <td className="px-4 bg-transparent">
                                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                                    {statuses.map(st => {
                                                        const isSelected = record.id_status === st.id_status;
                                                        const labelLower = st.status.toLowerCase();

                                                        let activeClass = 'btn-outline-light opacity-50';
                                                        if (isSelected) {
                                                            if (labelLower === 'hadir') activeClass = 'btn-success text-white shadow-sm fw-bold';
                                                            else if (labelLower === 'sakit') activeClass = 'btn-warning text-dark shadow-sm fw-bold';
                                                            else if (labelLower === 'izin') activeClass = 'btn-info text-dark shadow-sm fw-bold';
                                                            else if (isAlpaStatus(labelLower)) activeClass = 'btn-danger text-white shadow-sm fw-bold';
                                                        }

                                                        return (
                                                            <button
                                                                key={st.id_status}
                                                                type="button"
                                                                className={`btn btn-sm rounded-pill px-3 py-1 ${activeClass}`}
                                                                style={{ minWidth: '75px', fontSize: '0.82rem' }}
                                                                onClick={() => handleStatusChange(record.id_user, st.id_status)}
                                                            >
                                                                {st.status}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default PresensiAsdos;
