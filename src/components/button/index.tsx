import { IReactProps, ReadyOnlyProps } from '@/settings/type';
import Regular from './regular';

type TRegularProps = ReadyOnlyProps<{
  onClick?: () => void;
}>;

const Button = ({ children, onClick }: IReactProps & TRegularProps) => {
  return (
    <button className='btn' onClick={onClick}>
      {children}
    </button>
  );
};

Button.regular = Regular;

export default Button;
