// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Untuk pindah halaman
import '../../assets/css/Login.css'; // Panggil CSS yang tadi dibuat
import logoPA from '../../assets/img/logo_pa.jpeg';
const Login = () => {
    // 1. STATE: Untuk menampung apa yang diketik user
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Tools untuk pindah halaman
    const navigate = useNavigate();

    // 2. LOGIC LOGIN (Pengganti Script JS di bawah PHP Anda)
    const handleLogin = (e) => {
        e.preventDefault(); // Mencegah halaman refresh
        
        // Logika sederhana sesuai PHP Anda:
        // Jika username mengandung kata "mhs", lempar ke dashboard mahasiswa
        if (username.includes('mhs')) {
            navigate('/mahasiswa/dashboard');
        } else {
            // Selain itu, lempar ke dashboard asdos
            navigate('/asdos/dashboard');
        }
    };

    return (
        <div className="login-wrapper container-fluid g-0">
            <div className="row g-0">
                
                {/* Bagian Kiri (Gambar) */}
                <div className="col-lg-7 d-none d-lg-flex login-left">
                    <div className="login-brand-content">
                        <h1 className="brand-title">Practicum Assistants</h1>
                        <p className="brand-desc mx-auto">
                            Platform terintegrasi manajemen praktikum. <br />
                            Memudahkan pengelolaan jadwal, materi, dan penilaian tugas <br /> dalam satu sistem yang efisien.
                        </p>
                    </div>
                </div>

                {/* Bagian Kanan (Form) */}
                <div className="col-lg-5 login-right">
                    <div className="login-card">
                        <div className="text-center mb-5">
                            {/* Logo sementara (Ganti src ini jika gambar error) */}
                            <img src={logoPA} alt="Logo PA" width="120" className="mb-4 rounded shadow-sm" />                               
                            <h4 className="fw-bold text-dark mb-1">Welcome Back!</h4>
                            <p className="text-muted small">Silakan login untuk melanjutkan.</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="form-floating mb-3">
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0" 
                                    id="username" 
                                    placeholder="NIM/Username" 
                                    required
                                    // Ambil nilai inputan user
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <label htmlFor="username" className="text-muted">NIM / Username</label>
                            </div>

                            <div className="form-floating mb-4">
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0" 
                                    id="password" 
                                    placeholder="Password" 
                                    required
                                    // Ambil nilai password
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password" className="text-muted">Password</label>
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-100 shadow-sm py-3">
                                Sign In
                            </button>

                            <div className="text-center mt-4">
                                <a href="#" className="text-decoration-none small text-muted">Lupa Password?</a>
                            </div>
                        </form>

                        <div className="mt-5 text-center text-muted small" style={{ fontSize: '0.7rem' }}>
                            &copy; 2025 Lab Teknik
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;