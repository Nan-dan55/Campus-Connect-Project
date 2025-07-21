import { useState } from 'react';
import { BiMenu, BiX, BiUser, BiHome, BiBook, BiEnvelope, BiCog, BiCalendar, BiNews, BiGroup } from 'react-icons/bi';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onLogout, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavbar_3050 = () => {
    setIsOpen(!isOpen);
  };

  const handleLoginClick_3050 = () => {
    navigate('/login');
  };

  const handleLogoutClick_3050 = () => {
    onLogout();
    navigate('/');
  };

  const handleProfileClick_3050 = () => {
    navigate('/profile');
  };

  const handleAdminClick_3050 = () => {
    navigate('/admin/dashboard');
  };

  const scrollToSection_3050 = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  // Helper to scroll or navigate and scroll
  const handleNavScroll = (sectionId) => {
    if (location.pathname === '/') {
      // Already on homepage, just scroll
      scrollToSection_3050(sectionId);
    } else {
      // Navigate to homepage, then scroll
      navigate('/', { replace: false });
      // Wait for navigation, then scroll
      setTimeout(() => {
        scrollToSection_3050(sectionId);
      }, 100);
    }
    setIsOpen(false);
  };

  return (
    <header id="home_3050">
      <h1>SCAN</h1>
      <div className={`navbar-container_3050 ${isOpen ? 'active_3050' : ''}`}>
        <BiX className="navbar-close-icon_3050" onClick={handleNavbar_3050} />
        <nav className="nav-links_3050">
          <ul className="link-style_3050">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavScroll('home_3050'); }}>
                <BiHome className="nav-icon_3050" /> Home
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavScroll('about'); }}>
                <BiBook className="nav-icon_3050" /> About
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavScroll('contact'); }}>
                <BiEnvelope className="nav-icon_3050" /> Contact
              </a>
            </li>
            {isLoggedIn && userRole === 'no' && (
              <>
                <li>
                  <Link to="/events" onClick={() => setIsOpen(false)}>
                    <BiCalendar className="nav-icon_3050" /> Events
                  </Link>
                </li>
                <li>
                  <Link to="/notices" onClick={() => setIsOpen(false)}>
                    <BiNews className="nav-icon_3050" /> Notices
                  </Link>
                </li>
                <li>
                  <Link to="/notes" onClick={() => setIsOpen(false)}>
                    <BiBook className="nav-icon_3050" /> Notes
                  </Link>
                </li>
                <li>
                  <Link to="/clubs" onClick={() => setIsOpen(false)}>
                    <BiGroup className="nav-icon_3050" /> Clubs
                  </Link>
                </li>
              </>
            )}
            {isLoggedIn && userRole === 'yes' && (
              <>
                <li>
                  <Link to="/admin/dashboard" onClick={(e) => { handleAdminClick_3050(); setIsOpen(false); }}>
                    <BiCog className="profile-icon_3050" /> Admin
                  </Link>
                </li>
                <li>
                  <Link to="/notes" onClick={() => setIsOpen(false)}>
                    <BiBook className="nav-icon_3050" /> Notes
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        {isLoggedIn ? (
          <button className="logout-btn_3050" onClick={handleLogoutClick_3050}>
            Log Out
          </button>
        ) : (
          <button className="login-btn_3050" onClick={handleLoginClick_3050}>
            Log In
          </button>
        )}
      </div>
      <BiMenu className="navbar-menu-icon_3050" onClick={handleNavbar_3050} />
    </header>
  );
};

export default Navbar;