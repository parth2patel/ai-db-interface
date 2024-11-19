import Form from 'next/form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function DbConfigForm({
  action,
  children,
}: {
  action: any;
  children: React.ReactNode;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="host"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Host
        </Label>

        <Input
          id="host"
          name="host"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="localhost"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="port"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Port
        </Label>

        <Input
          id="port"
          name="port"
          className="bg-muted text-md md:text-sm"
          type="number"
          placeholder="5432"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="dbName"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Database Name
        </Label>

        <Input
          id="dbName"
          name="dbName"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="staging"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="dbUserName"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          User Name
        </Label>

        <Input
          id="dbUserName"
          name="dbUserName"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="postgres"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
        />
      </div>

      {children}
    </Form>
  );
}
