import { IReactProps, ReadyOnlyProps } from '@/settings/type';

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

export default Button;
