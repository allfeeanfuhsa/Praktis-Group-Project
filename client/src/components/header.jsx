import React from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { useAuth } from '../context/authContext'; // 2. Import Auth Context

// Default placeholder image
const profileImg = "https://via.placeholder.com/42";

const Header = () => {
  const { user } = useAuth(); // 3. Get current user data

  const getProfileLink = () => {
    const roles = user?.roles || []; // Safely access roles array

    if (roles.includes('admin')) return '/admin/profile';
    if (roles.includes('asdos')) return '/asdos/profile';
    if (roles.includes('mahasiswa')) return '/mahasiswa/profile';

    return '/profile'; // Fallback
  };
  return (
    <>
      {/* Navbar Fixed Top */}
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-primary border-bottom shadow-sm fixed-top py-3"
        style={{ zIndex: 1050 }}
      >
        <div className="container-fluid px-4">

          {/* Brand Logo - Added Link to home/dashboard */}
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <span style={{ letterSpacing: '1px', fontSize: '1.3rem' }}>
              PRACTICUM ASSISTANTS
            </span>
          </Link>

          {/* Bagian Kanan (Profile User) */}
          {/* 4. Changed <div> to <Link> and added 'text-decoration-none' */}
          <Link
            to={getProfileLink()}
            className="d-flex align-items-center text-white gap-3 text-decoration-none"
            title="Lihat Profil Saya"
          >
            <div className="text-end d-none d-md-block line-height-sm">
              <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                Halo, {user?.nama?.split(' ')[0] || 'User'}
              </div>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>
                {user?.role === 'admin' ? 'Administrator' : (user?.prodi || user?.role)}
              </div>
            </div>

            <img
              src={profileImg}
              className="rounded-circle border border-2 border-white shadow-sm"
              width="42"
              height="42"
              alt="Profile"
              style={{ objectFit: 'cover' }}
            />
          </Link>
        </div>
      </nav>

      {/* Spacer agar konten tidak ketutup Navbar (Margin Top 78px) */}
      <div style={{ marginTop: '78px' }}></div>
    </>
  );
};

export default Header;