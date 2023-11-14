import { IReactProps, ReadyOnly } from '@/settings/type';

type TRegularProps = ReadyOnly<{
  onClick?: () => void;
}>;

const Button = ({ children, onClick }: IReactProps & TRegularProps) => {
  return (
    <button className='btn' onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
