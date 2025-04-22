import { memo } from 'react';
import { Link } from 'react-router-dom';

const Error = memo(() => {
  return (
    <main className='grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8'>
      <div className='text-center'>
        <p className='text-base-content text-base font-semibold'>404</p>
        <h1 className='text-secondary-content mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl'>
          Page not found
        </h1>
        <p className='text-base-content mt-6 text-lg font-medium text-pretty sm:text-xl/8'>
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className='mt-10 flex items-center justify-center gap-x-6'>
          <Link to='/' className='bg-secondary-content text-base-300 btn'>
            Go back home
          </Link>
          <a href='#' className='text-base-content text-sm font-semibold'>
            Contact support <span aria-hidden='true'>&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
});
export default Error;
