import useUpdate from '@/hooks/useUpdate';
import { Context } from '@/settings/constant';
import { ActionType, IReactProps } from '@/settings/type';
import {
  ChangeEvent,
  memo,
  useContext,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';

type TProps = {
  table: string;
  data: any;
  update: () => void;
};

type TEditProps = {
  data: {
    [key: string]: any;
  };
};

interface RefObject {
  getChange: () => object;
}

const InputGroup = forwardRef(({ data }: TEditProps, ref) => {
  const dataRef = useRef(data);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dataRef.current[name] = value;
  };

  useImperativeHandle(ref, () => ({
    getChange() {
      return dataRef.current;
    },
  }));

  return (
    <div className='join'>
      {Object.entries(data).map((item) => (
        <input
          key={JSON.stringify(item)}
          className='input input-bordered join-item'
          placeholder={item[0]}
          defaultValue={String(item[1])}
          onChange={onChange}
          name={item[0]}
        />
      ))}
    </div>
  );
});

const Edit = memo(({ children, table, data, update }: IReactProps & TProps) => {
  const inputRef = useRef<RefObject>();

  const [respond, getUpdate] = useUpdate();
  const [, setContext] = useContext(Context);

  const editableData = Object.fromEntries(
    Object.entries(data).filter((item) => item[0] !== '_id' && item[0] !== '__v'),
  );

  const onClose = () => {
    const currentData = inputRef.current?.getChange();
    if (data._id && currentData) {
      getUpdate({
        table,
        data: {
          filter: String(data._id),
          data: currentData,
        },
      });
    }
  };

  useEffect(() => {
    if (respond) {
      console.log(respond);
      update();
    }
  }, [respond]);

  return (
    <button
      onClick={() => {
        setContext({
          type: ActionType.modal,
          state: {
            enabled: true,
            title: 'Edit and submit',
            label: 'submit',
            body: <InputGroup ref={inputRef} data={editableData} />,
            onClose,
          },
        });
      }}
      className='btn btn-xs btn-info'
    >
      {children}
    </button>
  );
});
export default Edit;
