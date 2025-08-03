import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Navbar = ({ colors }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
const handleLogout = () => {
  MySwal.fire({
    title: <strong>Confirmation de déconnexion</strong>,
    html: <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: colors.error,
    cancelButtonColor: colors.textSecondary,
    confirmButtonText: 'Oui, se déconnecter',
    cancelButtonText: 'Annuler',
    background: colors.card,
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom',
      confirmButton: 'swal2-confirm-custom',
    }
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('selectedTitle');

      navigate('/login');
    }
  });
};

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      background: colors.navBg,
      boxShadow: `0 2px 12px 0 ${colors.navShadow}`,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
    }}>
<div style={{ display: "flex", alignItems: "center", position: "relative", left: "30px" }}>
  <a href="/">
    <img src="/logo.png" alt="Logo" style={{  height: "32px", marginRight: "8px" }} />
  </a>
  <div style={{ fontWeight: 700, fontSize: 22, color: colors.primary, letterSpacing: 1 }}>
    <span style={{ color: colors.secondary }}>AI</span> Study
  </div>
</div>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <NavLink to="/upload" label="Uploader un PDF" active={location.pathname === "/upload"} colors={colors} />
        <NavLink to="/chat" label="Poser une question" active={location.pathname === "/chat"} colors={colors} />
        <NavLink to="/exercises" label="Générer des exercices" active={location.pathname === "/exercises"} colors={colors} />
        
        <button
          onClick={handleLogout}
          style={{
            color: colors.error,
            background: 'transparent',
            border: `1px solid ${colors.error}`,
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            marginRight: '30px',
            transition: 'all 0.2s',
            ':hover': {
              backgroundColor: `${colors.error}11`,
            }
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ to, label, active, colors }) => {
  return (
    <Link
      to={to}
      style={{
        color: active ? colors.primary : colors.textSecondary,
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 16,
        padding: "8px 18px",
        borderRadius: 8,
        background: active ? colors.primary + "11" : "none",
        transition: "background 0.2s, color 0.2s",
        boxShadow: active ? `0 2px 8px 0 ${colors.primary}22` : "none",
      }}
    >
      {label}
    </Link>
  );
};

export default Navbar;