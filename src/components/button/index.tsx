import { IReactProps } from '@/settings/type';
import { ReadyOnly } from '@/settings/type-unity';
import { twMerge } from 'tailwind-merge';

type TRegularProps = ReadyOnly<{
  onClick?: () => void;
  className?: string;
}>;

const Button = ({ children, className = '', onClick }: IReactProps & TRegularProps) => {
  return (
    <button className={twMerge('btn', className)} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
