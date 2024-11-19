'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DbConfigForm } from '@/components/custom/db-config-form';
import { SubmitButton } from '@/components/custom/submit-button';
import { Button } from '@/components/ui/button';

import {
  AddDbConfigActionState,
  authenticate,
  DbConfigActionState,
  register,
} from '../actions';

export default function Page() {
  const router = useRouter();

  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<AddDbConfigActionState, FormData>(
    register,
    {
      status: 'idle',
    }
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'config_updated') {
      toast.success('Config updated');
      setIsSuccessful(true);
      router.replace('/');
    } else if (state.status === 'unauthorized') {
      toast.error('Unauthorized!');
    } else if (state.status === 'success') {
      toast.success('Config saved');
      setIsSuccessful(true);
      router.replace('/');
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Database Credentials
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Please enter the credentials of your database below
          </p>
        </div>
        <DbConfigForm action={handleSubmit}>
          <SubmitButton isSuccessful={isSuccessful}>Submit</SubmitButton>
        </DbConfigForm>
        <div className="flex flex-col gap-6 px-4 sm:px-16">
          <h1 className="text-lg text-center font-semibold dark:text-zinc-50">
            OR
          </h1>
          <a href="/">
            <Button className="w-full">Use Sample Database</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
