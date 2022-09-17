import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

export function Root() {
  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="flex flex-col gap-2">
        <CommandItemComponent
          name="jack"
          command="jackd -d dummy -p 256"
          status="running"
        />
        <CommandItemComponent
          name="alsa out"
          command="alsa_out -d hw:1 "
          status="success"
        />
        <CommandItemComponent
          name="alsa in"
          command="alsa_in -d hw:2"
          status="error"
        />
        <button className="self-center" onClick={() => {}}>
          <PlusCircleIcon className="w-8 h-8 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

type CommandStatus = "success" | "error" | "running";

function CommandItemComponent(props: {
  name: string;
  command: string;
  status: CommandStatus;
  // onNameChange
  // onCommandChange
  // onStart
  // onStop
  // onShowLog
  // onDelete
}) {
  return (
    <div className="flex items-center gap-2 p-2 border bg-white">
      {props.status === "success" && (
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
      )}
      {props.status === "error" && (
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      )}
      {props.status === "running" && (
        <SunIcon className="w-5 h-5 text-green-500" />
      )}
      <input
        className="px-1 border w-[120px]"
        placeholder="name"
        value={props.name}
      />
      <input
        className="px-1 border flex-1"
        placeholder="command"
        spellCheck={false}
        value={props.command}
        disabled={props.status === "running"}
      />
      {props.status !== "running" && (
        <button className="px-2 border bg-gray-600 text-white font-bold text-sm self-stretch w-[70px] uppercase">
          start
        </button>
      )}
      {props.status === "running" && (
        <button className="px-2 border bg-gray-600 text-white font-bold text-sm self-stretch w-[70px] uppercase">
          stop
        </button>
      )}
      <button className="px-2 border bg-gray-600 text-white font-bold text-sm self-stretch w-[50px] uppercase">
        log
      </button>
      <button className="flex items-center">
        <XCircleIcon className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
}
