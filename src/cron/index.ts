import nodeCron from 'node-cron';
import Wallet from '../models/wallet.model.js';

const runSchedules = () => {
  nodeCron.schedule(
    '0 0 * * *',
    async () => {
      await Wallet.updateMany(
        {},
        {
          $set: {
            messagesAmount: 20,
          },
        },
      );
    },
    { timezone: 'Africa/Luanda' },
  );
};

export default runSchedules;
