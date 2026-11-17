import mongoose from 'mongoose';
import { IRespond } from '../../../setting';
import { messages } from '../config';
import models from '../models';

type Delete = { _id: string };

const deleteOne = ({ collection, data }: { collection: string; data: Delete }) => {
  return new Promise<IRespond>((resolve) => {
    if (!mongoose.connections[0].readyState) {
      resolve({ res: false, msg: messages.deleteError, collection });
      return;
    }

    // the filter is built here from a validated _id and never taken from the body as-is:
    // passing `data` straight to deleteOne would let `{}` or `{ _id: { $ne: null } }` match
    // every document, and a malformed id would throw a CastError that crashes the function
    const _id = data?._id;
    if (typeof _id !== 'string' || !mongoose.isValidObjectId(_id)) {
      resolve({ res: false, msg: messages.invalidId, collection });
      return;
    }

    try {
      const currentModel = models[collection] as typeof mongoose.Model;
      currentModel
        .deleteOne({ _id })
        .then((e) => {
          if (e.deletedCount === 1) resolve({ res: true, msg: messages.deleteSuccess, collection });
          else resolve({ res: false, msg: messages.deleteNotFound, collection });
        })
        .catch((error: unknown) => {
          resolve({ res: false, msg: messages.deleteError, collection, error });
        });
    } catch (error: unknown) {
      resolve({ res: false, msg: messages.deleteError, collection, error });
    }
  });
};
export default deleteOne;
