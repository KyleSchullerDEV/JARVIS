import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsData {
  userName: string;
  openAIModel: string;
  openAIApiKey: string;
  maxToolRoundtrips: number;
  temperature: number;
}

interface SettingsState extends SettingsData {
  setUserName: (userName: string) => void;
  setOpenAIModel: (model: string) => void;
  setOpenAIApiKey: (apiKey: string) => void;
  setMaxToolRoundtrips: (maxToolRoundtrips: number) => void;
  setTemperature: (temperature: number) => void;
  getSettingsData: () => SettingsData;
  updateSettingsData: (newSettings: Partial<SettingsData>) => void;
}

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

const fileStorage = {
  getItem: (): string | null => {
    try {
      return fs.readFileSync(SETTINGS_FILE, 'utf-8');
    } catch (error) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    fs.writeFileSync(SETTINGS_FILE, value, 'utf-8');
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      userName: process.env.PRIMARY_USER || '',
      openAIModel: process.env.OPENAI_API_MODEL || '',
      openAIApiKey: process.env.OPENAI_API_KEY || '',
      maxToolRoundtrips: Number(process.env.MAX_TOOL_ROUND_TRIPS) || 5,
      temperature: Number(process.env.TEMPERATURE) || 0.5,
      setUserName: (userName) => set({ userName }),
      setOpenAIModel: (openAIModel) => set({ openAIModel }),
      setOpenAIApiKey: (openAIApiKey) => set({ openAIApiKey }),
      setMaxToolRoundtrips: (maxToolRoundtrips) => set({ maxToolRoundtrips }),
      setTemperature: (temperature) => set({ temperature }),
      getSettingsData: () => {
        const { userName, openAIModel, openAIApiKey, maxToolRoundtrips, temperature } = get();
        return { userName, openAIModel, openAIApiKey, maxToolRoundtrips, temperature };
      },
      updateSettingsData: (newSettings) => set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'settings-storage',
      storage: {
        getItem: (name) => {
          const value = fileStorage.getItem();
          return value ? JSON.parse(value)[name] : null;
        },
        setItem: (name, value) => {
          const prevValue = fileStorage.getItem();
          const newValue = JSON.stringify({
            ...JSON.parse(prevValue || '{}'),
            [name]: value,
          });
          fileStorage.setItem(name, newValue);
        },
      },
    }
  )
);

// Function to update environment variables
export const updateEnvVariables = () => {
  const settings = useSettingsStore.getState().getSettingsData();
  process.env.PRIMARY_USER = settings.userName;
  process.env.OPENAI_API_MODEL = settings.openAIModel;
  process.env.OPENAI_API_KEY = settings.openAIApiKey;
  process.env.MAX_TOOL_ROUND_TRIPS = settings.maxToolRoundtrips.toString();
  process.env.TEMPERATURE = settings.temperature.toString();
};

// Initialize environment variables on app start
export const initializeEnvVariables = () => {
  updateEnvVariables();
};