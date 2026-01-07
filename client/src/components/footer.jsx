import React from 'react';

const Footer = () => {
    return (
        // Kita gunakan tag semantic <footer>
        <footer className="py-4 bg-light mt-auto">
            <div className="container-fluid px-4">
                <div className="d-flex align-items-center justify-content-between small">
                    <div className="text-muted">Copyright &copy; Praktis Group Project 2025</div>
                    <div>
                        <a href="#" className="text-decoration-none">Privacy Policy</a>
                        &middot;
                        <a href="#" className="text-decoration-none">Terms &amp; Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;