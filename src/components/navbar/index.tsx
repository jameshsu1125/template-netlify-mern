import { memo } from 'react';
import { Link } from 'react-router-dom';

const Navbar = memo(() => (
  <div className='navbar bg-base-300 absolute top-0'>
    <div className='navbar-start'>
      <Link to='/' className='btn btn-ghost normal-case text-xl'>
        Dashboard
      </Link>
    </div>
    <div className='navbar-end'>
      <label htmlFor='my-drawer-2' className='lg:hidden btn drawer-button'>
        Menu
      </label>
    </div>
  </div>
));
export default Navbar;
