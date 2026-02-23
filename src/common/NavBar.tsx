import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../common/AuthContext';
import logo from '../assets/logo.png';
import carritoIcon from '../assets/carrito-de-compras.png';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { t } = useTranslation('global');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm"
     style={{
       backgroundColor: '#111',
       borderBottom: '1px solid #2a2a2a'
     }}>
      <div className="container py-2">
        <Link to="/" className="navbar-brand d-flex align-items-center fw-semibold text-white">
          <img
            src={logo}
            alt="Red Polish Logo"
            style={{ width: '90px', height: '45px', marginRight: '12px', objectFit: 'contain' }}
          />
          <span style={{ letterSpacing: '1px' }}>Red Polish</span>
        </Link>

        {user && user.rol !== 'Administrador' && (
          <Link
            to="/shopping-cart"
            className="d-lg-none nav-link p-0 me-2"
            style={{ width: '20px', height: '20px' }}
          >
            <img src={carritoIcon} alt="Carrito" className="img-fluid" />
          </Link>
        )}

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
          style={{ filter: 'invert(1)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto align-items-center">
            <li className="nav-item">
              <Link to="/catalog" className="nav-link text-light mx-2" style={{ transition: 'all 0.3s ease' }}>{t('products')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link text-light mx-2"style={{ transition: 'all 0.3s ease' }}>{t('services')}</Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-center">
            {user && user.rol !== 'Administrador' && (
              <li className="nav-item me-3 d-none d-lg-block">
                <Link to="/shopping-cart" className="nav-link p-0">
                  <img
                    src={carritoIcon}
                    alt="Carrito"
                    style={{
                      width: '28px',
                      height: '28px',
                      filter: 'invert(1)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </Link>
              </li>
            )}
            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link text-light mx-2" style={{ transition: 'all 0.3s ease' }}>{t('login')}</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link text-light mx-2" style={{ transition: 'all 0.3s ease' }}>{t('register')}</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/user" className="nav-link text-light mx-2" style={{ transition: 'all 0.3s ease' }}>{t('user')}</Link>
                </li>
                <li className="nav-item">
                <button
                  className="btn btn-sm ms-2"
                  style={{
                    backgroundColor: '#8B0000',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={handleLogout}
                >
                  Cerrar sesion
                </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
