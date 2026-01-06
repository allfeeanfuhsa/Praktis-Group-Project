// src/layouts/LayoutMhs.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMhs from '../components/SidebarMhs';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LayoutMhs = () => {
    const [isToggled, setIsToggled] = useState(false);

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    return (
        <>
            {/* 1. HEADER (Di Luar Wrapper) - Agar Logo Sidebar aman */}
            <Header />

            <div className="d-flex" id="wrapper">
                
                {/* 2. SIDEBAR MAHASISWA */}
                <div className={isToggled ? "bg-white" : ""} id="sidebar-wrapper-container">
                    <SidebarMhs />
                </div>

                {/* 3. KONTEN (Sticky Footer applied) */}
                <div 
                    id="page-content-wrapper" 
                    className="d-flex flex-column" 
                    style={{ width: '100%', minHeight: '100vh' }}
                >
                    
                    {/* Navbar Mobile */}
                    <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-3 px-4 d-md-none border-bottom">
                        <div className="d-flex align-items-center">
                            <i 
                                className="bi bi-list fs-3 me-3" 
                                id="menu-toggle"
                                onClick={handleToggle}
                                style={{ cursor: 'pointer' }}
                            ></i>
                            <h5 className="fw-bold mb-0 text-dark">Menu Mahasiswa</h5>
                        </div>
                    </nav>

                    {/* Area Konten */}
                    <div className="container-fluid px-4 py-4 flex-grow-1">
                        <Outlet />
                    </div>

                    <Footer />
                    
                </div>
            </div>
        </>
    );
};

export default LayoutMhs;