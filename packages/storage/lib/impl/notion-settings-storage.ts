import { createStorage, StorageEnum } from '../base/index.js';
import type { NotionSettingsStateType, NotionSettingsStorageType } from '../base/index.js';

const storage = createStorage<NotionSettingsStateType>(
  'notion-settings-storage-key',
  {
    notionApiKey: '',
    notionDatabaseId: '',
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const notionSettingsStorage: NotionSettingsStorageType = {
  ...storage,
  updateSettings: async (settings: Partial<NotionSettingsStateType>) => {
    await storage.set(currentState => ({
      ...currentState,
      ...settings,
    }));
  },
};
