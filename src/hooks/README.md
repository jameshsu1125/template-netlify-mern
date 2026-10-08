# Hooks

## Table of components

- [Hooks](#hooks)
  - [Table of components](#table-of-components)
  - [Type (typescript)](#type-typescript)
  - [useConnect](#useconnect)
    - [Usage](#usage)
    - [Development](#development)
  - [useSelect](#useselect)
    - [Usage](#usage-1)
    - [Development](#development-1)
  - [useInsert](#useinsert)
    - [Usage](#usage-2)
    - [Development](#development-2)
  - [useUpdate](#useupdate)
    - [Usage](#usage-3)
    - [Development](#development-3)
  - [useDelete](#usedelete)
    - [Usage](#usage-4)
    - [Development](#development-4)

## Type (typescript)

```ts
export type IRespond = ReadyOnly<{
  res: boolean;
  msg: string;
  data?: TYPE[];
}>;
```

## useConnect

To connect to a MongoDB.

### Usage

```JSX
import useConnect from '@/hooks/useConnect';

export default function () {
  const [respond, getConnection] = useConnect();

  return <button onClick={getConnection}>BUTTON</button>;
}
```

### Development

| method        |       type        |     description     | return |
| :------------ | :---------------: | :-----------------: | -----: |
| respond       | [IRespond](#type) | respond from server |   void |
| getConnection |     function      |   get connection    |   void |

## useSelect

To get all data from a collection.

### Usage

```JSX
import useSelect from '@/hooks/useSelect';

export default function () {
  const [respond, getData] = useSelect();

  return (
    <button
      onClick={() => {
        getData({ collection: 'your collection name' });
      }}
    >
      BUTTON
    </button>
  );
}
```

### Development

| method  |       type        |      description       | return |
| :------ | :---------------: | :--------------------: | -----: |
| respond | [IRespond](#type) |  respond from server   |   void |
| getData |     function      | get data from database |   void |

## useInsert

To insert one data into a collection.

### Usage

```JSX
import useInsert from '@/hooks/useInsert';

export default function () {
  const [respond, insertOne] = useInsert();

  return (
    <button
      onClick={() => {
        const data = { username: 'admin', password: '1234' }; // user data
        insertOne({ collection: 'your collection name', data });
      }}
    >
      BUTTON
    </button>
  );
}
```

### Development

| method  |       type        |         description         | return |
| :------ | :---------------: | :-------------------------: | -----: |
| respond | [IRespond](#type) |     respond from server     |   void |
| getData |     function      | insert a data into database |   void |

## useUpdate

To update one data with a collection.

### Usage

```JSX
import useUpdate from '@/hooks/useUpdate';

export default function () {
  const [respond, updateOne] = useUpdate();

  return (
    <button
      onClick={() => {
        const data = { username: 'admin', password: '1234' }; // user data
        const _id = '6128211234'; // collection table id
        updateOne({ collection: 'your collection name', data: { _id, data } });
      }}
    >
      BUTTON
    </button>
  );
}
```

### Development

| method    |       type        |         description         | return |
| :-------- | :---------------: | :-------------------------: | -----: |
| respond   | [IRespond](#type) |     respond from server     |   void |
| updateOne |     function      | update a data with database |   void |

## useDelete

To delete one data from a collection.

### Usage

```JSX
import useDelete from '@/hooks/useDelete';

export default function () {
  const [respond, deleteOne] = useDelete();

  return (
    <button
      onClick={() => {
        deleteOne({ collection: 'your collection name', data: { _id: '6128211234' } });
      }}
    >
      BUTTON
    </button>
  );
}
```

### Development

| method  |       type        |         description         | return |
| :------ | :---------------: | :-------------------------: | -----: |
| respond | [IRespond](#type) |     respond from server     |   void |
| getData |     function      | delete a data from database |   void |
