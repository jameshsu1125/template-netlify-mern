import { memo } from 'react';
import { BiSolidDashboard } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const Navbar = memo(() => (
  <div className='navbar absolute top-0 bg-base-300'>
    <div className='navbar-start'>
      <Link to='/' className='btn btn-ghost text-xl normal-case'>
        <BiSolidDashboard />
        {import.meta.env.VITE_TITLE}
      </Link>
    </div>
    <div className='navbar-end'>
      <label htmlFor='my-drawer-2' className='btn drawer-button lg:hidden'>
        Menu
      </label>
    </div>
  </div>
));
export default Navbar;
