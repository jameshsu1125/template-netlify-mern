import mongoose from 'mongoose';
import { IRespond, TType } from '../../../setting';
import { messages } from '../config';
import models from '../models';

type UpdateData = {
  _id: string;
  data: Partial<TType>;
};

const update = ({ collection, data }: { collection: string; data: UpdateData }) => {
  return new Promise<IRespond>((resolve) => {
    if (!mongoose.connections[0].readyState) {
      resolve({ res: false, msg: messages.updateError, collection });
      return;
    }

    // _id is validated before it reaches the query: an unchecked value lets the caller
    // send an operator object as the filter, and a malformed id throws a CastError
    const _id = data?._id;
    if (typeof _id !== 'string' || !mongoose.isValidObjectId(_id)) {
      resolve({ res: false, msg: messages.invalidId, collection });
      return;
    }

    // the payload is written straight into findOneAndUpdate, so a key like $unset or $rename
    // would run as a mongo operator instead of being stored as a field value.
    // dotted keys are rejected too: every schema in setting/index.ts is flat, so a.b can only
    // be an attempt to reach somewhere the caller should not
    const payload = data.data;
    const isPlainObject =
      typeof payload === 'object' && payload !== null && !Array.isArray(payload);
    const keys = isPlainObject ? Object.keys(payload) : [];
    if (
      !isPlainObject ||
      keys.length === 0 ||
      keys.some((key) => key.startsWith('$') || key.includes('.'))
    ) {
      resolve({ res: false, msg: messages.invalidPayload, collection });
      return;
    }

    try {
      const currentModel = models[collection] as typeof mongoose.Model;
      currentModel
        .findOneAndUpdate({ _id }, payload)
        .then((matched) => {
          // findOneAndUpdate resolves to null when nothing matched, reporting success there
          // made the caller believe a write happened
          if (matched) resolve({ res: true, msg: messages.updateSuccess, collection });
          else resolve({ res: false, msg: messages.updateNotFound, collection });
        })
        .catch((error: unknown) => {
          resolve({ res: false, msg: messages.updateError, collection, error });
        });
    } catch (error: unknown) {
      resolve({ res: false, msg: messages.updateError, collection, error });
    }
  });
};

export default update;
