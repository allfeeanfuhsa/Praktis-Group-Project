import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/authContext';
import { getCleanFilename } from '../../utils/fileHelpers';
import { motion } from 'framer-motion';

const Timeline = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [rawTimeline, setRawTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    // Industry-Standard Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'PAST'
    const [hasMaterialsOnly, setHasMaterialsOnly] = useState(false);
    const [hasTasksOnly, setHasTasksOnly] = useState(false);

    // Collapsed Date Nodes State (Feature: Click dot marker to hide/show nodes)
    const [collapsedDates, setCollapsedDates] = useState({});
    const [allCollapsed, setAllCollapsed] = useState(false);

    const toggleDateCollapse = (dateKey) => {
        setCollapsedDates(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    // Modal preview state
    const [selectedSession, setSelectedSession] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Ref for today node auto-scroll
    const todayNodeRef = useRef(null);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/content/user-timeline');
                setRawTimeline(res.data.timeline || []);
            } catch (err) {
                console.error("Timeline fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, []);

    // Auto-scroll to TODAY node
    useEffect(() => {
        if (!loading && todayNodeRef.current) {
            setTimeout(() => {
                todayNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [loading]);

    const roles = user?.roles || [];
    const isAdmin = roles.includes('admin');
    const isAsdos = roles.includes('asdos');

    const getDashboardLink = () => {
        if (isAdmin) return '/admin/dashboard';
        if (isAsdos) return '/asdos/dashboard';
        return '/mahasiswa/dashboard';
    };

    const getSessionDetailLink = (session) => {
        const { id_praktikum, id_pertemuan, user_role } = session;
        if (user_role === 'admin') return `/admin/praktikum/${id_praktikum}`;
        if (user_role === 'asdos') return `/asdos/kelas/${id_praktikum}/session/${id_pertemuan}`;
        return `/mahasiswa/kelas/${id_praktikum}/session/${id_pertemuan}`;
    };

    const formatDate = (dateObj) => {
        return dateObj.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short'
        });
    };

    const formatFullDate = (dateObj) => {
        return dateObj.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getLocalDateStr = (d) => {
        const dateObj = new Date(d);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Filter timeline data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateStr(today);

    const filteredTimeline = rawTimeline.filter(s => {
        // 1. Search Query Filter
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            const matchTitle = s.mata_kuliah?.toLowerCase().includes(q);
            const matchCode = s.kode_kelas?.toLowerCase().includes(q);
            const matchRoom = s.ruangan?.toLowerCase().includes(q);
            if (!matchTitle && !matchCode && !matchRoom) return false;
        }

        // 2. Status filter
        const sessDate = new Date(s.tanggal);
        sessDate.setHours(0, 0, 0, 0);
        if (filterStatus === 'UPCOMING' && sessDate < today) return false;
        if (filterStatus === 'PAST' && sessDate >= today) return false;

        // 3. Content Toggles
        if (hasMaterialsOnly && (s.materialsCount || 0) === 0) return false;
        if (hasTasksOnly && (s.tasksCount || 0) === 0) return false;

        return true;
    });

    const isFilterActive = searchTerm !== '' || filterStatus !== 'ALL' || hasMaterialsOnly || hasTasksOnly;

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterStatus('ALL');
        setHasMaterialsOnly(false);
        setHasTasksOnly(false);
    };

    // 1. GENERATE CONTINUOUS DAY-BY-DAY SEQUENCE
    const sessionsByDate = {};
    filteredTimeline.forEach(s => {
        const dStr = getLocalDateStr(s.tanggal);
        if (!sessionsByDate[dStr]) sessionsByDate[dStr] = [];
        sessionsByDate[dStr].push(s);
    });

    let minTime = today.getTime();
    let maxTime = today.getTime();

    if (rawTimeline.length > 0) {
        rawTimeline.forEach(s => {
            const t = new Date(s.tanggal).setHours(0, 0, 0, 0);
            if (t < minTime) minTime = t;
            if (t > maxTime) maxTime = t;
        });
    }

    const startDate = new Date(minTime);
    startDate.setDate(startDate.getDate() - 3);

    const endDate = new Date(maxTime);
    endDate.setDate(endDate.getDate() + 7);

    const allDays = [];
    let curr = new Date(startDate);

    while (curr <= endDate) {
        const dateStr = getLocalDateStr(curr);
        const isToday = dateStr === todayStr;
        const isPast = curr < today;
        const sessions = sessionsByDate[dateStr] || [];

        allDays.push({
            dateObj: new Date(curr),
            dateStr,
            isToday,
            isPast,
            sessions,
            dayOfMonth: curr.getDate()
        });

        curr.setDate(curr.getDate() + 1);
    }

    // 2. BREAK INTO 30-DAY ROWS (SNAKE PATH)
    const DAYS_PER_ROW = 30; 
    const dayRows = [];

    for (let i = 0; i < allDays.length; i += DAYS_PER_ROW) {
        dayRows.push({
            rowIndex: dayRows.length,
            days: allDays.slice(i, i + DAYS_PER_ROW)
        });
    }

    const baseURL = api.defaults.baseURL || 'http://localhost:5001';

    if (loading) {
        return (
            <div className={`text-center py-5 ${isAdmin ? 'text-primary' : 'text-light'}`}>
                <div className={`spinner-border ${isAdmin ? 'text-primary' : 'text-light'}`} role="status">
                    <span className="visually-hidden">Loading timeline...</span>
                </div>
                <p className={`${isAdmin ? 'text-muted' : 'opacity-75'} mt-3 small`}>Membangun jalur 30 hari linimasa...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0 py-3" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* TOP HEADER BAR & DASHBOARD NAVIGATION */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-3">
                <button
                    onClick={() => navigate(getDashboardLink())}
                    className={isAdmin ? "btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-2" : "btn btn-outline-light btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-2 border-opacity-50"}
                    style={{ fontSize: '0.85rem' }}
                >
                    <i className="bi bi-arrow-left"></i>
                    <span>Kembali ke Dashboard</span>
                </button>

                {/* Counter Badge */}
                <div className={isAdmin ? "badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill fw-bold" : "badge bg-light bg-opacity-10 text-white border border-light border-opacity-20 px-3 py-1.5 rounded-pill fw-bold"} style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-calendar3 me-1.5"></i>
                    {filteredTimeline.length} dari {rawTimeline.length} Sesi
                </div>
            </div>

            {/* INDUSTRY STANDARD TOOLBAR FILTER CARD */}
            <div 
                className={isAdmin ? "card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white text-dark" : "glass-card static rounded-4 p-3 mb-4 text-white"} 
                style={{ 
                    background: isAdmin ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                    border: isAdmin ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.15)' 
                }}
            >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    
                    {/* SEARCH INPUT */}
                    <div className="position-relative flex-grow-1" style={{ minWidth: '220px', maxWidth: '340px' }}>
                        <i className={`bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 ${isAdmin ? 'text-muted' : 'text-light opacity-50'}`} style={{ fontSize: '0.85rem' }}></i>
                        <input
                            type="text"
                            placeholder="Cari mata kuliah atau kelas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={isAdmin ? "form-control form-control-sm rounded-pill ps-5 pe-3 py-1.5 bg-light border-0 text-dark" : "form-control form-control-sm rounded-pill ps-5 pe-3 py-1.5 bg-dark bg-opacity-50 text-white border-light border-opacity-25"}
                            style={{ fontSize: '0.82rem' }}
                        />
                        {searchTerm && (
                            <i 
                                className="bi bi-x-circle-fill position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer opacity-75 hover-opacity-100" 
                                style={{ fontSize: '0.85rem' }} 
                                onClick={() => setSearchTerm('')}
                            ></i>
                        )}
                    </div>

                    {/* STATUS SEGMENTED CONTROL (PILL TABS) */}
                    <div 
                        className={isAdmin ? "p-1 bg-light rounded-pill d-inline-flex border" : "p-1 rounded-pill d-inline-flex border border-light border-opacity-25"}
                        style={{ background: isAdmin ? '#f8fafc' : 'rgba(0,0,0,0.25)' }}
                    >
                        <button
                            type="button"
                            onClick={() => setFilterStatus('ALL')}
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 transition-all ${filterStatus === 'ALL' ? (isAdmin ? 'bg-white text-primary shadow-sm' : 'bg-info text-dark shadow') : (isAdmin ? 'text-muted' : 'text-light opacity-75')}`}
                            style={{ fontSize: '0.78rem' }}
                        >
                            Semua Sesi
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('UPCOMING')}
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 transition-all ${filterStatus === 'UPCOMING' ? (isAdmin ? 'bg-primary text-white shadow-sm' : 'bg-primary text-white shadow') : (isAdmin ? 'text-muted' : 'text-light opacity-75')}`}
                            style={{ fontSize: '0.78rem' }}
                        >
                            <i className="bi bi-circle-fill me-1.5 text-success" style={{ fontSize: '0.55rem' }}></i>
                            Mendatang
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('PAST')}
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 transition-all ${filterStatus === 'PAST' ? (isAdmin ? 'bg-secondary text-white shadow-sm' : 'bg-secondary text-white shadow') : (isAdmin ? 'text-muted' : 'text-light opacity-75')}`}
                            style={{ fontSize: '0.78rem' }}
                        >
                            Selesai
                        </button>
                    </div>

                    {/* CONTENT CHIP TOGGLES */}
                    <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
                        
                        {/* TOGGLE: ADA MATERI */}

                        {/* TOGGLE: ADA MATERI */}
                        <button
                            type="button"
                            onClick={() => setHasMaterialsOnly(!hasMaterialsOnly)}
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 transition-all ${
                                hasMaterialsOnly 
                                    ? (isAdmin ? 'btn-info text-white shadow-sm' : 'btn-info text-dark fw-bold') 
                                    : (isAdmin ? 'btn-outline-secondary border-opacity-50' : 'btn-outline-light border-opacity-25 opacity-75')
                            }`}
                            style={{ fontSize: '0.78rem' }}
                        >
                            <i className="bi bi-journal-text"></i>
                            <span>Ada Materi</span>
                        </button>

                        {/* TOGGLE: ADA TUGAS */}
                        <button
                            type="button"
                            onClick={() => setHasTasksOnly(!hasTasksOnly)}
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 transition-all ${
                                hasTasksOnly 
                                    ? (isAdmin ? 'btn-warning text-dark shadow-sm' : 'btn-warning text-dark fw-bold') 
                                    : (isAdmin ? 'btn-outline-secondary border-opacity-50' : 'btn-outline-light border-opacity-25 opacity-75')
                            }`}
                            style={{ fontSize: '0.78rem' }}
                        >
                            <i className="bi bi-clipboard-check"></i>
                            <span>Ada Tugas</span>
                        </button>

                        {/* TOGGLE: CIUTKAN / TAMPILKAN SEMUA NODES */}
                        <button
                            type="button"
                            onClick={() => {
                                if (allCollapsed) {
                                    setCollapsedDates({});
                                    setAllCollapsed(false);
                                } else {
                                    const map = {};
                                    allDays.forEach(d => {
                                        if (d.sessions && d.sessions.length > 0) {
                                            map[d.dateStr] = true;
                                        }
                                    });
                                    setCollapsedDates(map);
                                    setAllCollapsed(true);
                                }
                            }}
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 transition-all ${
                                allCollapsed 
                                    ? (isAdmin ? 'btn-primary text-white shadow-sm' : 'btn-primary text-white shadow') 
                                    : (isAdmin ? 'btn-outline-secondary border-opacity-50' : 'btn-outline-light border-opacity-25 opacity-75')
                            }`}
                            style={{ fontSize: '0.78rem' }}
                            title="Ciutkan atau tampilkan seluruh kartu sesi pada timeline"
                        >
                            <i className={allCollapsed ? "bi bi-eye" : "bi bi-eye-slash"}></i>
                            <span>{allCollapsed ? "Tampilkan Sesi" : "Ciutkan Sesi"}</span>
                        </button>

                        {/* RESET BUTTON */}
                        {isFilterActive && (
                            <button
                                onClick={handleResetFilters}
                                className={isAdmin ? "btn btn-sm btn-link text-danger text-decoration-none fw-bold p-0 ms-2" : "btn btn-sm btn-link text-warning text-decoration-none fw-bold p-0 ms-2"}
                                style={{ fontSize: '0.8rem' }}
                            >
                                <i className="bi bi-x-circle me-1"></i>Reset
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {rawTimeline.length === 0 ? (
                <div className={isAdmin ? "card border-0 shadow-sm rounded-4 p-5 text-center bg-white" : "glass-card static rounded-4 p-5 text-center text-white"}>
                    <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50 text-warning"></i>
                    <h5 className="fw-bold mb-2">Belum Ada Sesi</h5>
                    <p className={isAdmin ? "text-muted mb-0" : "text-light opacity-75 mb-0"}>Belum ada sesi praktikum yang terdaftar.</p>
                </div>
            ) : filteredTimeline.length === 0 ? (
                <div className={isAdmin ? "card border-0 shadow-sm rounded-4 p-5 text-center bg-white" : "glass-card static rounded-4 p-5 text-center text-white"}>
                    <i className="bi bi-funnel fs-1 d-block mb-3 opacity-50 text-info"></i>
                    <h5 className="fw-bold mb-2">Tidak Ada Sesi Cocok</h5>
                    <p className={isAdmin ? "text-muted mb-3" : "text-light opacity-75 mb-3"}>Tidak ada sesi praktikum yang sesuai dengan filter yang dipilih.</p>
                    <div>
                        <button onClick={handleResetFilters} className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-bold">
                            Reset Semua Filter
                        </button>
                    </div>
                </div>
            ) : (
                <div className="position-relative px-2 px-md-4 py-4 overflow-x-auto">

                    {/* 30-DAY SNAKE ROWS */}
                    {dayRows.map((row) => {
                        const isEven = row.rowIndex % 2 === 0;
                        const displayDays = isEven ? row.days : [...row.days].reverse();

                        return (
                            <div key={row.rowIndex} className="position-relative mb-5 pb-5 pt-4" style={{ minWidth: '1000px' }}>

                                {/* CONTINUOUS LINE ACROSS ALL 30 DAYS */}
                                <div 
                                    className="position-absolute start-0 end-0" 
                                    style={{ 
                                        top: '110px',
                                        height: '4px', 
                                        background: isAdmin 
                                            ? 'linear-gradient(90deg, #e2e8f0, #0d6efd, #e2e8f0)' 
                                            : 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(13,202,240,0.6), rgba(255,255,255,0.15))',
                                        zIndex: 1,
                                        borderRadius: '4px'
                                    }}
                                ></div>

                                {/* PERFECT ELEGANT U-TURN CONNECTORS */}
                                {row.rowIndex < dayRows.length - 1 && (
                                    <div 
                                        className="position-absolute d-none d-md-block"
                                        style={{
                                            top: '110px',
                                            [isEven ? 'right' : 'left']: '-18px',
                                            width: '36px',
                                            height: '256px',
                                            borderTop: isAdmin ? '4px solid #0d6efd' : '4px solid rgba(13,202,240,0.5)',
                                            borderBottom: isAdmin ? '4px solid #0d6efd' : '4px solid rgba(13,202,240,0.5)',
                                            [isEven ? 'borderRight' : 'borderLeft']: isAdmin ? '4px solid #0d6efd' : '4px solid rgba(13,202,240,0.5)',
                                            [isEven ? 'borderTopRightRadius' : 'borderTopLeftRadius']: '20px',
                                            [isEven ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: '20px',
                                            zIndex: 1,
                                            pointerEvents: 'none'
                                        }}
                                    ></div>
                                )}

                                {/* 30-COLUMN EQUAL GRID FOR 30 DAYS */}
                                <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 2 }}>
                                    {displayDays.map((dayItem) => {
                                        const hasSessions = dayItem.sessions.length > 0;
                                        const sessionCount = dayItem.sessions.length;
                                        const isCollapsed = Boolean(collapsedDates[dayItem.dateKey || dayItem.dateStr]);

                                        return (
                                            <div 
                                                key={dayItem.dateStr}
                                                ref={dayItem.isToday ? todayNodeRef : null}
                                                className="d-flex flex-column align-items-center position-relative"
                                                style={{ flex: 1, minWidth: '32px' }}
                                            >
                                                {/* TOP BALLOON BRANCHES AREA */}
                                                <div className="position-relative d-flex justify-content-center align-items-end mb-1" style={{ height: '90px', width: '100%', pointerEvents: 'none' }}>
                                                    
                                                    {/* SVG DIAGONAL BRANCH LINES FOR SESSIONS */}
                                                    {(hasSessions || (dayItem.isToday && !hasSessions)) && !isCollapsed && (
                                                        <svg className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}>
                                                            {hasSessions ? dayItem.sessions.map((s, idx) => {
                                                                const xOffset = sessionCount > 1 ? (idx - (sessionCount - 1) / 2) * 50 : 0;
                                                                return (
                                                                    <line 
                                                                        key={idx}
                                                                        x1="50%" 
                                                                        y1="100%" 
                                                                        x2={`calc(50% + ${xOffset}px)`} 
                                                                        y2="34px" 
                                                                        stroke={isAdmin ? (dayItem.isPast ? '#cbd5e1' : '#0d6efd') : (dayItem.isPast ? 'rgba(255,255,255,0.3)' : '#0dcaf0')} 
                                                                        strokeWidth="2.5" 
                                                                        strokeDasharray={sessionCount > 1 ? '4 3' : 'none'}
                                                                    />
                                                                );
                                                            }) : (
                                                                /* Single straight line for TODAY marker balloon */
                                                                <line x1="50%" y1="100%" x2="50%" y2="34px" stroke="#dc3545" strokeWidth="2.5" />
                                                            )}
                                                        </svg>
                                                    )}

                                                    {dayItem.isToday && !hasSessions && (
                                                        /* Dedicated TODAY Pulsing Balloon */
                                                        <motion.div
                                                            initial={{ scale: 0.9 }}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                            className="rounded-circle d-flex flex-column align-items-center justify-content-center text-white shadow-lg border border-white border-2 text-center"
                                                            style={{
                                                                width: '64px',
                                                                height: '64px',
                                                                minWidth: '64px',
                                                                minHeight: '64px',
                                                                flexShrink: 0,
                                                                background: 'linear-gradient(135deg, #dc3545, #900c3f)',
                                                                boxShadow: '0 0 15px rgba(220, 53, 69, 0.9)',
                                                                cursor: 'default',
                                                                zIndex: 2,
                                                                pointerEvents: 'none'
                                                            }}
                                                        >
                                                            <span className="fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem', letterSpacing: '0.5px', lineHeight: 1 }}>
                                                                TODAY
                                                            </span>
                                                        </motion.div>
                                                    )}

                                                    {/* BALLOON NODES POSITIONED AT DIAGONAL BRANCH ENDPOINTS */}
                                                    {!isCollapsed && (
                                                        <div className="position-relative w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 2, pointerEvents: 'none' }}>
                                                            {dayItem.sessions.map((s, sIdx) => {
                                                                const xOffset = sessionCount > 1 ? (sIdx - (sessionCount - 1) / 2) * 50 : 0;
                                                                
                                                                // Theme styling calculations
                                                                let bgStyle = dayItem.isPast 
                                                                    ? 'rgba(255,255,255,0.1)' 
                                                                    : 'linear-gradient(135deg, rgba(13,110,253,0.75), rgba(13,202,240,0.75))';
                                                                let borderStyle = dayItem.isPast 
                                                                    ? '2px solid rgba(255,255,255,0.25)' 
                                                                    : '2px solid rgba(13,202,240,0.9)';
                                                                let shadowStyle = dayItem.isPast ? 'none' : '0 4px 15px rgba(13,202,240,0.45)';
                                                                let badgeBg = 'bg-dark bg-opacity-75 text-white border border-light border-opacity-25';

                                                                if (isAdmin) {
                                                                    bgStyle = dayItem.isPast 
                                                                        ? '#f1f5f9' 
                                                                        : 'linear-gradient(135deg, #0d6efd, #0b5ed7)';
                                                                    borderStyle = dayItem.isPast 
                                                                        ? '2px solid #cbd5e1' 
                                                                        : '2px solid #0d6efd';
                                                                    shadowStyle = dayItem.isPast ? 'none' : '0 4px 15px rgba(13,110,253,0.3)';
                                                                    badgeBg = dayItem.isPast 
                                                                        ? 'bg-secondary bg-opacity-25 text-dark' 
                                                                        : 'bg-white text-primary shadow-sm';
                                                                }

                                                                return (
                                                                    <motion.div
                                                                        key={s._id || sIdx}
                                                                        whileHover={{ scale: 1.15 }}
                                                                        onClick={() => { setSelectedSession(s); setShowModal(true); }}
                                                                        className={`rounded-circle d-flex flex-column align-items-center justify-content-center transition-all position-absolute ${dayItem.isPast ? (isAdmin ? 'text-secondary opacity-75' : 'text-white opacity-50 grayscale-hover') : 'text-white'}`}
                                                                        style={{
                                                                            width: '64px',
                                                                            height: '64px',
                                                                            top: '2px',
                                                                            left: `calc(50% + ${xOffset}px - 32px)`,
                                                                            cursor: 'pointer',
                                                                            background: bgStyle,
                                                                            border: borderStyle,
                                                                            boxShadow: shadowStyle,
                                                                            backdropFilter: isAdmin ? 'none' : 'blur(16px)',
                                                                            WebkitBackdropFilter: isAdmin ? 'none' : 'blur(16px)',
                                                                            pointerEvents: 'auto',
                                                                            borderRadius: '50%'
                                                                        }}
                                                                    >
                                                                        {/* Kode Kelas */}
                                                                        <span className="fw-bold text-truncate px-1 d-block mb-1" style={{ fontSize: '0.66rem', maxWidth: '56px', lineHeight: 1 }}>
                                                                            {s.kode_kelas}
                                                                        </span>

                                                                        {/* Sesi Ke Badge */}
                                                                        <span
                                                                            className={`badge rounded-pill fw-bold px-1.5 py-0.5 ${badgeBg}`}
                                                                            style={{ fontSize: '0.6rem', lineHeight: 1 }}
                                                                        >
                                                                            Sesi {s.sesi_ke}
                                                                        </span>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                </div>

                                                {/* DAY TICK DOT MARKER ON THE LINE */}
                                                <motion.div 
                                                    whileHover={hasSessions ? { scale: 1.4 } : {}}
                                                    onClick={() => hasSessions && toggleDateCollapse(dayItem.dateStr)}
                                                    className={`rounded-circle shadow-sm transition-all position-relative ${
                                                        dayItem.isToday 
                                                            ? 'bg-danger animate-pulse border border-2 border-white' 
                                                            : hasSessions 
                                                            ? (isCollapsed 
                                                                ? 'bg-warning text-dark border border-2 border-white'
                                                                : (isAdmin ? 'bg-primary border border-2 border-white' : 'bg-info border border-2 border-white')) 
                                                            : dayItem.isPast 
                                                            ? (isAdmin ? 'bg-secondary bg-opacity-25' : 'bg-secondary bg-opacity-40') 
                                                            : (isAdmin ? 'bg-secondary bg-opacity-50' : 'bg-light bg-opacity-50')
                                                    }`} 
                                                    style={{ 
                                                        width: hasSessions || dayItem.isToday ? '16px' : '8px', 
                                                        height: hasSessions || dayItem.isToday ? '16px' : '8px', 
                                                        zIndex: 3,
                                                        cursor: hasSessions ? 'pointer' : 'default'
                                                    }}
                                                    title={hasSessions 
                                                        ? (isCollapsed 
                                                            ? `Klik untuk melihat ${sessionCount} sesi (${formatFullDate(dayItem.dateObj)})` 
                                                            : `Klik untuk menciutkan ${sessionCount} sesi (${formatFullDate(dayItem.dateObj)})`)
                                                        : formatFullDate(dayItem.dateObj)
                                                    }
                                                >
                                                    {/* If collapsed and has sessions, show badge counter */}
                                                    {hasSessions && isCollapsed && (
                                                        <span 
                                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark border border-white fw-bold shadow-sm"
                                                            style={{ fontSize: '0.55rem', padding: '0.15em 0.35em' }}
                                                        >
                                                            {sessionCount}
                                                        </span>
                                                    )}
                                                </motion.div>

                                                {/* DATE NUMBER / LABEL BELOW LINE */}
                                                <div 
                                                    className={`small text-center mt-2 ${
                                                        dayItem.isToday 
                                                            ? 'text-danger fw-bold' 
                                                            : hasSessions 
                                                            ? (isAdmin ? 'text-primary fw-bold' : 'text-info fw-bold') 
                                                            : (isAdmin ? 'text-muted opacity-75' : 'text-light opacity-40')
                                                    }`} 
                                                    style={{ fontSize: '0.68rem' }}
                                                >
                                                    {dayItem.dayOfMonth}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

            {/* PREVIEW MODAL (ADAPTIVE THEME FOR ADMIN VS ASDOS/MAHASISWA) */}
            {showModal && selectedSession && createPortal(
                <div 
                    className="modal fade show d-block position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                    tabIndex="-1" 
                    style={{ 
                        zIndex: 99999, 
                        background: isAdmin ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.75)', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        overflowY: 'auto',
                        pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg my-auto" style={{ zIndex: 100000, pointerEvents: 'auto', width: '100%', maxWidth: '800px' }}>
                        <div 
                            className={isAdmin ? "card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-dark w-100" : "glass-card static rounded-4 shadow-lg p-0 text-white w-100 overflow-hidden"} 
                            style={{ 
                                pointerEvents: 'auto',
                                background: isAdmin ? '#ffffff' : 'rgba(15, 23, 42, 0.75)',
                                backdropFilter: isAdmin ? 'none' : 'blur(24px)',
                                WebkitBackdropFilter: isAdmin ? 'none' : 'blur(24px)',
                                border: isAdmin ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }}
                        >
                            {/* Modal Header */}
                            <div className={isAdmin ? "p-4 bg-primary text-white d-flex justify-content-between align-items-center" : "p-4 border-bottom border-light border-opacity-10 d-flex justify-content-between align-items-center"}>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={isAdmin ? "badge bg-white text-primary px-3 py-1.5 rounded-pill fw-bold" : "badge border border-light text-light px-3 py-1.5 rounded-pill"} style={{ fontSize: '0.85rem' }}>
                                        {selectedSession.kode_kelas} • Sesi {selectedSession.sesi_ke}
                                    </span>
                                    <h5 className="fw-bold mb-0">{selectedSession.mata_kuliah}</h5>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <small className={isAdmin ? "text-muted d-block text-uppercase fw-bold mb-1" : "text-light opacity-75 d-block text-uppercase fw-bold mb-1"} style={{ fontSize: '0.7rem' }}>Tanggal</small>
                                        <div className="fw-bold"><i className="bi bi-calendar-event me-2 text-primary"></i>{formatFullDate(new Date(selectedSession.tanggal))}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <small className={isAdmin ? "text-muted d-block text-uppercase fw-bold mb-1" : "text-light opacity-75 d-block text-uppercase fw-bold mb-1"} style={{ fontSize: '0.7rem' }}>Waktu</small>
                                        <div className="fw-bold"><i className="bi bi-clock me-2 text-warning"></i>{selectedSession.waktu_mulai} - {selectedSession.waktu_selesai}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <small className={isAdmin ? "text-muted d-block text-uppercase fw-bold mb-1" : "text-light opacity-75 d-block text-uppercase fw-bold mb-1"} style={{ fontSize: '0.7rem' }}>Ruangan</small>
                                        <div className="fw-bold"><i className="bi bi-geo-alt me-2 text-danger"></i>{selectedSession.ruangan}</div>
                                    </div>
                                </div>

                                {/* Materials Section */}
                                <h6 className="fw-bold mb-2 d-flex align-items-center">
                                    <i className="bi bi-journal-text me-2 text-primary"></i>Materi Pembelajaran ({selectedSession.materialsCount})
                                </h6>
                                <div className="mb-4">
                                    {selectedSession.materials.length === 0 ? (
                                        <div className={isAdmin ? "card p-3 rounded-3 text-muted small bg-light border-0" : "glass-card static p-3 rounded-3 text-light opacity-50 small"}>Belum ada materi terunggah.</div>
                                    ) : (
                                        selectedSession.materials.map(m => (
                                            <div key={m._id} className={isAdmin ? "card p-3 rounded-3 mb-2 bg-light border-0" : "glass-card static p-3 rounded-3 mb-2"} style={{ background: isAdmin ? '#f8fafc' : 'rgba(255,255,255,0.04)' }}>
                                                <div className="fw-bold mb-1">{m.judul}</div>
                                                {m.attachments && m.attachments.length > 0 && (
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        {m.attachments.map((file, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={`${baseURL}/api/content/materi/${m._id}/download/${idx}?view=true`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={isAdmin ? "badge bg-white text-primary border border-primary border-opacity-25 px-2.5 py-1.5 rounded-pill text-decoration-none d-inline-flex align-items-center gap-1.5 shadow-sm" : "badge bg-light bg-opacity-25 text-white border border-light border-opacity-25 px-2.5 py-1.5 rounded-pill text-decoration-none d-inline-flex align-items-center gap-1.5"}
                                                            >
                                                                <i className="bi bi-file-earmark-text text-primary"></i>
                                                                <span>{getCleanFilename(file.filename)}</span>
                                                                <i className="bi bi-box-arrow-up-right small ms-1"></i>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Tasks Section */}
                                <h6 className="fw-bold mb-2 d-flex align-items-center">
                                    <i className="bi bi-clipboard-check me-2 text-warning"></i>Tugas Sesi Ini ({selectedSession.tasksCount})
                                </h6>
                                <div>
                                    {selectedSession.tasks.length === 0 ? (
                                        <div className={isAdmin ? "card p-3 rounded-3 text-muted small bg-light border-0" : "glass-card static p-3 rounded-3 text-light opacity-50 small"}>Tidak ada tugas pada sesi ini.</div>
                                    ) : (
                                        selectedSession.tasks.map(t => (
                                            <div key={t._id} className={isAdmin ? "card p-3 rounded-3 mb-2 bg-light border-0 d-flex flex-row justify-content-between align-items-center" : "glass-card static p-3 rounded-3 mb-2 d-flex justify-content-between align-items-center"} style={{ background: isAdmin ? '#f8fafc' : 'rgba(255,255,255,0.04)' }}>
                                                <div>
                                                    <div className="fw-bold mb-1">{t.judul}</div>
                                                    <small className={isAdmin ? "text-muted" : "text-light opacity-75"} style={{ fontSize: '0.75rem' }}>
                                                        <i className="bi bi-clock me-1"></i>Deadline: {new Date(t.tenggat_waktu).toLocaleString('id-ID')}
                                                    </small>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className={isAdmin ? "p-4 border-top text-end d-flex justify-content-between align-items-center bg-light" : "p-4 border-top border-light border-opacity-10 d-flex justify-content-between align-items-center"}>
                                <button type="button" className={isAdmin ? "btn btn-outline-secondary rounded-pill px-4 fw-bold" : "btn btn-outline-light rounded-pill px-4 fw-bold"} onClick={() => setShowModal(false)}>
                                    Tutup
                                </button>

                                {isAdmin ? (
                                    <button 
                                        type="button" 
                                        className="btn btn-primary shadow-sm rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                                        onClick={() => {
                                            setShowModal(false);
                                            navigate('/admin/praktikum', { 
                                                state: { 
                                                    openSessionClassId: selectedSession.id_praktikum,
                                                    targetSessionId: selectedSession.id_pertemuan 
                                                } 
                                            });
                                        }}
                                    >
                                        <i className="bi bi-calendar-week me-1"></i>
                                        <span>Kelola Sesi Kelas</span>
                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="btn btn-primary shadow-sm rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                                        onClick={() => {
                                            setShowModal(false);
                                            navigate(getSessionDetailLink(selectedSession));
                                        }}
                                    >
                                        <span>Masuk Sesi Detail</span>
                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Timeline;
