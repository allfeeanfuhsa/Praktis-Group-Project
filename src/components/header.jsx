import React from 'react';

// Import gambar profile default
// (Pastikan file gambarnya ada di folder src/assets/img/)
const profileImg = "https://via.placeholder.com/42"; // <-- Tambahkan ini
const Header = () => {
  return (
    <>
      {/* Navbar Fixed Top */}
      <nav 
        className="navbar navbar-expand-lg navbar-dark bg-primary border-bottom shadow-sm fixed-top py-3" 
        style={{ zIndex: 1050 }} // Style inline diubah jadi Object JS
      >
        <div className="container-fluid px-4">
            
            {/* Brand Logo */}
            <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
                <span style={{ letterSpacing: '1px', fontSize: '1.3rem' }}>
                    PRACTICUM ASSISTANTS
                </span>
            </a>
            
            {/* Bagian Kanan (Profile User) */}
            <div className="d-flex align-items-center text-white gap-3">
                <div className="text-end d-none d-md-block line-height-sm">
                    {/* Nanti nama ini bisa diganti pakai variabel dinamis dari Login */}
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Halo, User</div>
                    <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Informatika</div>
                </div>
                
                {/* Gambar Profile */}
                <img 
                    src={profileImg} 
                    className="rounded-circle border border-2 border-white shadow-sm" 
                    width="42" 
                    height="42" 
                    alt="Profile" 
                    style={{ objectFit: 'cover' }} 
                />
            </div>
        </div>
      </nav>

      {/* Spacer agar konten tidak ketutup Navbar (Margin Top 78px) */}
      <div style={{ marginTop: '78px' }}></div>
    </>
  );
};

export default Header;