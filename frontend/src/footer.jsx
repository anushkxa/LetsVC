import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#333', color: '#fff', padding: '20px', textAlign: 'center' }}>
      <p>&copy; {new Date().getFullYear()} Anushka Ltd. . All rights reserved.</p>
      <nav>
        <a href="/privacy" style={{ color: '#fff', marginRight: '10px' }}>Privacy Policy</a>
        <a href="/terms" style={{ color: '#fff' }}>Terms of Service</a>
      </nav>
    </footer>
  );
};

export default Footer;