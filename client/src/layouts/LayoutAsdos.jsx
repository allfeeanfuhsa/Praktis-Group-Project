// src/layouts/LayoutAsdos.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAsdos from '../components/SidebarAsdos';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LayoutAsdos = () => {
    const [isToggled, setIsToggled] = useState(false);

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    return (
        // Gunakan Fragment <>...</> atau div pembungkus kosong
        <>
            {/* 1. Header PINDAH KE SINI (Di Luar Wrapper) */}
            {/* Efek: Spacer di dalam Header akan mendorong seluruh Wrapper ke bawah */}
            <Header />

            <div className="d-flex" id="wrapper">
                
                {/* 2. Sidebar */}
                <div className={isToggled ? "bg-white" : ""} id="sidebar-wrapper-container">
                    <SidebarAsdos />
                </div>

                {/* 3. Konten Kanan */}
                <div 
                    id="page-content-wrapper" 
                    className="d-flex flex-column" 
                    style={{ width: '100%', minHeight: '100vh' }}
                >
                    
                    {/* (Header di sini DIHAPUS) */}

                    {/* Navbar Mobile */}
                    <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-3 px-4 d-md-none border-bottom">
                        <div className="d-flex align-items-center">
                            <i 
                                className="bi bi-list fs-3 me-3" 
                                id="menu-toggle"
                                onClick={handleToggle}
                                style={{ cursor: 'pointer' }}
                            ></i>
                            <h5 className="fw-bold mb-0 text-dark">Menu Asisten</h5>
                        </div>
                    </nav>

                    {/* Isi Konten */}
                    <div className="container-fluid px-4 py-4 flex-grow-1">
                        <Outlet />
                    </div>

                    <Footer />
                    
                </div>
            </div>
        </>
    );
};

export default LayoutAsdos;