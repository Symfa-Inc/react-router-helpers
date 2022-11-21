import { notify } from 'react-notify-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import { HelperOutlet } from '@symfa/react-router-helpers';

export const GuardsPage = () => {
  const nav = useNavigate();
  const loginAsAdmin = () => {
    localStorage.setItem('isAdmin', 'true');
    notify.show("You are the admin now!", "custom", 5000, {
      background: '#63a138',
      text: "#FFFFFF"
    });
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    nav('/guards');
  };


  return <>
    <nav className="navbar navbar-expand-lg bg-light mt-4">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="admin-dashboard" className={(navData) => (navData.isActive ? 'active link-primary' : 'link-primary')}> Link to guarded admin dashboard</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div className="mt-3">
      <button type="button" className="btn btn-primary me-2" onClick={logout}>Logout</button>
      <button type="button" className="btn btn-primary" onClick={loginAsAdmin}>Login as admin</button>
    </div>
    <HelperOutlet />
  </>;
};
