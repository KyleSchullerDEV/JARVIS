import React, { useState, useEffect } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';

import { CaretDown, CaretUp, X } from '@phosphor-icons/react';

import Button from '../atoms/Button';

import { twMerge } from 'tailwind-merge';

interface SettingsData {
  userName: string;
  openAIModel: string;
  openAIApiKey: string;
  maxToolRoundtrips: number;
  temperature: number;
}

const modelOptions = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
] as const;

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultStyles = {
  input:
    'w-full rounded-3 border border-slate-700 bg-transparent py-2 px-3 focus:outline-none focus:border-slate-50 hover:border-slate-500',
  label: 'mb-2 inline-block',
  slider: {
    root: 'relative flex h-6 w-full touch-none select-none items-center',
    track: 'cursor-ew-resize relative h-2 grow rounded-full bg-slate-700',
    range: 'cursor-ew-resize absolute h-full rounded-full bg-blue-700',
    thumb:
      'block h-6 w-6 cursor-grab active:cursor-grabbing rounded-full bg-slate-500 focus:outline outline-slate-50 outline-offset-4 focus:bg-slate-50 hover:bg-slate-50',
  },
};

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<SettingsData>({
    userName: '',
    openAIModel: modelOptions[0],
    openAIApiKey: '',
    maxToolRoundtrips: 5,
    temperature: 0.5,
  });

  useEffect(() => {
    if (isOpen) {
      window.electronAPI.getSettings().then(setSettings);
    }
  }, [isOpen]);

  const handleChange = (name: string, value: string | number) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.electronAPI.updateSettings(settings).then(() => {
      onClose();
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-slate-800/50 backdrop-blur-md' />
        <Dialog.Content className='fixed left-1/2 top-1/2 max-h-full w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform overflow-auto rounded-4 bg-slate-900 p-6'>
          <Dialog.Title className='m-t-0 mb-6 font-display text-xl font-medium'>
            Settings
          </Dialog.Title>
          <Dialog.Description className='sr-only'>
            Control how the app behaves.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <fieldset>
              <Label.Root
                className={twMerge(defaultStyles.label)}
                htmlFor='userName'
              >
                Name{' '}
                <small className='text-slate-500'>
                  (JARVIS will occasionaly refer to you by this value)
                </small>
              </Label.Root>
              <input
                type='text'
                id='userName'
                name='userName'
                value={settings.userName}
                onChange={(e) => handleChange('userName', e.target.value)}
                className={twMerge(defaultStyles.input)}
              />
            </fieldset>
            <fieldset>
              <Label.Root
                className={twMerge(defaultStyles.label)}
                htmlFor='openAIModel'
              >
                OpenAI Model
              </Label.Root>
              <Select.Root
                value={settings.openAIModel}
                onValueChange={(value) => handleChange('openAIModel', value)}
              >
                <Select.Trigger
                  className={twMerge(
                    defaultStyles.input,
                    'flex items-center justify-between'
                  )}
                  aria-label='OpenAI Model'
                >
                  <Select.Value />
                  <Select.Icon>
                    <CaretDown />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    // position='popper'
                    // sideOffset={5}
                    className='w-[var(--radix-select-trigger-width)] overflow-hidden rounded-3 border border-current bg-slate-800 backdrop-blur-md'
                  >
                    <Select.ScrollUpButton className='flex h-6 cursor-default items-center justify-center bg-slate-900'>
                      <CaretUp />
                    </Select.ScrollUpButton>
                    <Select.Viewport>
                      {modelOptions.map((option) => (
                        <Select.Item
                          key={option}
                          value={option}
                          className='radix-disabled:opacity-50 relative flex select-none items-center px-3 py-2 focus:bg-slate-900 focus:outline-none'
                        >
                          <Select.ItemText>{option}</Select.ItemText>
                          <Select.ItemIndicator className='absolute left-2 inline-flex items-center'>
                            {/* You can add a checkmark icon here if desired */}
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className='flex h-6 cursor-default items-center justify-center bg-slate-800'>
                      <CaretDown />
                    </Select.ScrollDownButton>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </fieldset>
            <fieldset>
              <Label.Root
                className={twMerge(defaultStyles.label)}
                htmlFor='openAIApiKey'
              >
                OpenAI API Key
              </Label.Root>
              <input
                type='text'
                id='openAIApiKey'
                name='openAIApiKey'
                value={settings.openAIApiKey}
                onChange={(e) => handleChange('openAIApiKey', e.target.value)}
                className={twMerge(defaultStyles.input, 'font-mono')}
              />
            </fieldset>
            <fieldset>
              <Label.Root
                className={twMerge(defaultStyles.label)}
                htmlFor='maxToolRoundtrips'
              >
                Max Tool Roundtrips: <code>{settings.maxToolRoundtrips}</code>
              </Label.Root>
              <Slider.Root
                className={twMerge(defaultStyles.slider.root)}
                value={[settings.maxToolRoundtrips]}
                onValueChange={([value]) =>
                  handleChange('maxToolRoundtrips', value)
                }
                max={100}
                step={1}
                aria-label='Max Tool Roundtrips'
              >
                <Slider.Track className={twMerge(defaultStyles.slider.track)}>
                  <Slider.Range
                    className={twMerge(defaultStyles.slider.range)}
                  />
                </Slider.Track>
                <Slider.Thumb className={twMerge(defaultStyles.slider.thumb)} />
              </Slider.Root>
            </fieldset>
            <fieldset>
              <Label.Root
                className={twMerge(defaultStyles.label)}
                htmlFor='temperature'
              >
                Temperature: <code>{settings.temperature}</code>
              </Label.Root>
              <Slider.Root
                className={twMerge(defaultStyles.slider.root)}
                value={[settings.temperature]}
                onValueChange={([value]) => handleChange('temperature', value)}
                max={1}
                step={0.01}
                aria-label='Temperature'
              >
                <Slider.Track className={twMerge(defaultStyles.slider.track)}>
                  <Slider.Range
                    className={twMerge(defaultStyles.slider.range)}
                  />
                </Slider.Track>
                <Slider.Thumb className={twMerge(defaultStyles.slider.thumb)} />
              </Slider.Root>
            </fieldset>

            <div className='flex gap-4 justify-end'>
              <Dialog.Close asChild>
                <Button
                  type='button'
                  className='bg-slate-700'
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type='submit'
                className='bg-blue-700'
              >
                Save
              </Button>
            </div>
          </form>
          <Dialog.Close asChild>
            <button
              className='absolute right-3 top-3 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full border border-current hover:text-red-500 focus:text-red-500 focus:outline-none'
              aria-label='Close'
            >
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
