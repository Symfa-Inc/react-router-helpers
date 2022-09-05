import { Link, NavLink } from 'react-router-dom';
import { HelperOutlet } from '../../reactRouterHelpers/index';

export const HomePage = () => {
  return <>
    <nav className="navbar navbar-expand-lg bg-light">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className={(navData) => (navData.isActive ? 'active nav-link' : 'nav-link')}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/guards" className={(navData) => (navData.isActive ? 'active nav-link' : 'nav-link')}>Guards</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>


    <div className="p-2">
      <HelperOutlet />
    </div>
  </>;
};
