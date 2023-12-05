import useUpdate from '@/hooks/useUpdate';
import { Context } from '@/settings/constant';
import { ActionType, AlertType, IReactProps } from '@/settings/type';
import {
  ChangeEvent,
  memo,
  useContext,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  ChangeEventHandler,
} from 'react';
import { SETTING } from '../../../setting';
import { IType } from '../../../setting/type';

const { schema } = SETTING.mongodb[0];
type TProps = { type: typeof schema; collection: string; data: any; update: () => void };
type TEditProps = { type: typeof schema; data: { [key: string]: any } };
interface RefObject {
  getChange: () => object;
}

const Element = ({
  key,
  type,
  value,
  index,
  onChange,
}: {
  key: string;
  type: IType;
  value: string | boolean | number;
  index: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  switch (type) {
    case IType.String:
      return (
        <input
          key={JSON.stringify(key) + index}
          className='input join-item input-bordered input-sm w-28'
          placeholder={key}
          name={key}
          type='text'
          defaultValue={String(value)}
          onChange={onChange}
        />
      );
    case IType.Number:
      return (
        <input
          key={JSON.stringify(key) + index}
          className='input join-item input-bordered input-sm w-28'
          placeholder={key}
          name={key}
          type='number'
          defaultValue={String(value)}
          onChange={onChange}
        />
      );
    case IType.Boolean:
      return (
        <div className='form-control mx-2' key={JSON.stringify(key) + index}>
          <label className='label cursor-pointer space-x-2 pt-1'>
            <span className='label-text'>{key}</span>
            <input
              type='checkbox'
              name={key}
              className='checkbox'
              defaultChecked={value === true ? true : false}
              onChange={onChange}
            />
          </label>
        </div>
      );
  }
};

const InputGroup = forwardRef(({ data, type }: TEditProps, ref) => {
  const dataRef = useRef(data);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') dataRef.current[name] = checked;
    else dataRef.current[name] = value;
  };

  useImperativeHandle(ref, () => ({
    getChange() {
      return dataRef.current;
    },
  }));

  return (
    <div className='mockup-code'>
      <pre>
        <code>
          <div className='join join-vertical w-full items-center justify-center md:join-horizontal'>
            {Object.entries(data).map((item, index) => {
              const [key, value] = item;
              const [currentTarget] = Object.entries(type).filter(
                (typeItem) => typeItem[0] === key,
              );
              const [, currentValue] = currentTarget;
              const { type: currentType } = currentValue;
              return Element({ type: currentType, key: key, value, onChange, index });
            })}
          </div>
        </code>
      </pre>
    </div>
  );
});

const Edit = memo(({ children, type, collection, data, update }: IReactProps & TProps) => {
  const inputRef = useRef<RefObject>();

  const [respond, getUpdate] = useUpdate();
  const [, setContext] = useContext(Context);

  const editableData = Object.fromEntries(
    Object.entries(data).filter((item) => item[0] !== '_id' && item[0] !== '__v'),
  );

  const onClose = () => {
    const currentData = inputRef.current?.getChange();
    if (data._id && currentData) {
      getUpdate({ collection, data: { _id: String(data._id), data: currentData } });
    }
  };

  useEffect(() => {
    if (respond) {
      let type = AlertType.Error;
      if (respond.res) {
        type = AlertType.Success;
        update();
      }
      setContext({ type: ActionType.Alert, state: { enabled: true, type, body: respond.msg } });
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
            body: <InputGroup ref={inputRef} data={editableData} type={type} />,
            onClose,
          },
        });
      }}
      className='btn btn-info btn-xs'
    >
      {children}
    </button>
  );
});
export default Edit;
