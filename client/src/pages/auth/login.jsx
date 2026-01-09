// client/src/pages/auth/Login.jsx
import React, { useState } from 'react';
// 1. Remove useNavigate (The context handles navigation now)
// import { useNavigate } from 'react-router-dom'; 
import api from '../../utils/api';
import { useAuth } from '../../context/authContext'; // 2. Import useAuth
import '../../assets/css/Login.css';
import logoPA from '../../assets/img/logo_pa.jpeg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // 3. Get the login function from Context
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/login', {
                email,
                password
            });

            // 4. DELEGATE EVERYTHING TO CONTEXT
            // We pass the token and user data to the context.
            // The context will save them and decide where to redirect (Role Selection, Admin, etc.)
            login(response.data.token, response.data.user);

        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            setLoading(false); // Only stop loading on error (on success, we redirect)
        }
    };

    return (
        <div className="login-wrapper container-fluid g-0">
            <div className="row g-0">
                
                <div className="col-lg-7 d-none d-lg-flex login-left">
                    <div className="login-brand-content">
                        <h1 className="brand-title">Practicum Assistants</h1>
                        <p className="brand-desc mx-auto">
                            Platform terintegrasi manajemen praktikum. <br />
                            Memudahkan pengelolaan jadwal, materi, dan penilaian tugas <br /> dalam satu sistem yang efisien.
                        </p>
                    </div>
                </div>

                <div className="col-lg-5 login-right">
                    <div className="login-card">
                        <div className="text-center mb-5">
                            <img src={logoPA} alt="Logo PA" width="120" className="mb-4 rounded shadow-sm" />                               
                            <h4 className="fw-bold text-dark mb-1">Welcome Back!</h4>
                            <p className="text-muted small">Silakan login untuk melanjutkan.</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className="form-floating mb-3">
                                <input 
                                    type="email" 
                                    className="form-control bg-light border-0" 
                                    id="email" 
                                    placeholder="name@example.com" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                                <label htmlFor="email" className="text-muted">Email</label>
                            </div>

                            <div className="form-floating mb-4">
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0" 
                                    id="password" 
                                    placeholder="Password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <label htmlFor="password" className="text-muted">Password</label>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 shadow-sm py-3"
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
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