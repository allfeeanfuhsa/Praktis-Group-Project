// src/layouts/LayoutAdmin.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../components/SidebarAdmin';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LayoutAdmin = () => {
    // State untuk mengatur buka/tutup sidebar di Mobile
    const [isToggled, setIsToggled] = useState(false);

    // Fungsi untuk mengubah status toggle
    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    return (
        <>
            {/* 1. HEADER (Navbar Atas) - Ditaruh di luar wrapper */}
            <Header />

            <div className="d-flex" id="wrapper">
                
                {/* 2. SIDEBAR (Kiri) */}
                <div className={isToggled ? "bg-white" : ""} id="sidebar-wrapper-container">
                    <SidebarAdmin />
                </div>

                {/* 3. KONTEN UTAMA (Kanan) */}
                {/* PERBAIKAN: Tambahkan flex-column dan minHeight 100vh agar footer turun ke bawah */}
                <div 
                    id="page-content-wrapper" 
                    className="d-flex flex-column" 
                    style={{ width: '100%', minHeight: '100vh' }}
                >
                    
                    {/* Navbar Mobile (Hanya muncul di layar HP/Kecil) */}
                    <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-3 px-4 d-md-none border-bottom">
                        <div className="d-flex align-items-center">
                            <i 
                                className="bi bi-list fs-3 me-3" 
                                id="menu-toggle"
                                onClick={handleToggle}
                                style={{ cursor: 'pointer' }}
                            ></i>
                            <h5 className="fw-bold mb-0 text-dark">Menu Admin</h5>
                        </div>
                    </nav>

                    {/* OUTLET (Isi Dashboard) */}
                    {/* Class 'flex-grow-1' akan memaksa div ini memanjang mengisi ruang kosong */}
                    <div className="container-fluid px-4 py-4 flex-grow-1">
                        <Outlet />
                    </div>

                    {/* FOOTER */}
                    {/* Footer akan otomatis terdorong ke paling bawah */}
                    <Footer />
                    
                </div>
            </div>
        </>
    );
};

export default LayoutAdmin;