import type { Command, CommandStatus, Config } from "@-/common";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Transition } from "@headlessui/react";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  SunIcon,
} from "@heroicons/react/24/solid";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Save } from "react-feather";
import { UseFormRegisterReturn, useFieldArray, useForm } from "react-hook-form";
import { generateId } from "./misc";

export function Root() {
  return (
    <Providers>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </Providers>
  );
}

function Providers(props: React.PropsWithChildren) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 0,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}

function App() {
  //
  // form
  //

  const form = useForm<Config>({ defaultValues: { commands: [] } });
  const commandsForm = useFieldArray({
    control: form.control,
    name: "commands",
  });
  const updateConfig = form.handleSubmit((data) => mutationConfig.mutate(data));

  //
  // query/mutation
  //

  const queryConfig = useQuery({
    queryKey: ["/config/get"],
    queryFn: () => PRELOAD_API.service["/config/get"](),
    onSuccess: (data) => form.reset(data),
    onError: () => {
      window.alert("failed to load configuration");
    },
  });

  // TODO: queryStatus

  const mutationConfig = useMutation(
    (config: Config) => PRELOAD_API.service["/config/update"](config),
    {
      onSuccess: () => {
        queryConfig.refetch();
      },
      onError: () => {},
    }
  );

  // TODO: mutationProcess
  // TODO: monitor process status change event

  // Ctrl-s shortcut
  useDocumentEvent("keyup", (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s" && form.formState.isDirty) {
      updateConfig();
    }
  });

  return (
    <div className="relative h-full bg-gray-50">
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col items-center gap-2 m-4">
          <DndContext
            sensors={useSensors(useSensor(PointerSensor))}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={(e) => {
              const { over, active } = e;
              const { fields } = commandsForm;
              if (over && active.id !== over.id) {
                const from = fields.findIndex(({ id }) => id === active.id);
                const to = fields.findIndex(({ id }) => id === over.id);
                console.log({ from, to });
                if (from === -1 || to === -1) {
                  window.alert("invalid order");
                  return;
                }
                // TODO: investigate why `commandsForm.move(from, to)` doesn't work
                form.setValue("commands", arrayMove(fields, from, to), {
                  shouldDirty: true,
                });
                return;
              }
              // reset fields so that the dropped element can snap back to its original position
              form.setValue("commands", fields);
            }}
          >
            <SortableContext
              items={commandsForm.fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {commandsForm.fields.map((field, i) => (
                <CommandItemEditor
                  key={field.id}
                  command={field}
                  status={"success"}
                  register={(key) => form.register(`commands.${i}.${key}`)}
                  onDelete={() => commandsForm.remove(i)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            onClick={() => {
              commandsForm.append({ id: generateId(), name: "", command: "" });
            }}
            className="filter hover:brightness-130"
          >
            <PlusCircleIcon className="w-8 h-8 text-gray-600" />
          </button>
        </div>
      </div>
      {/*  */}
      {/* Save FAB (floating action button) */}
      {/*  */}
      <Transition
        show={form.formState.isDirty}
        className="absolute bottom-6 right-6 transition duration-250 transform"
        enterFrom="scale-25 opacity-0"
        enterTo="scale-100 opacity-100"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-25 opacity-0"
      >
        <button
          className="flex items-center gap-2 rounded-full text-sm font-bold shadow-xl bg-green-500 filter hover:brightness-90 transition duration-150 text-white p-2.5"
          onClick={updateConfig}
          title="Save (ctrl-s)"
        >
          <Save className="w-5 h-5" />
        </button>
      </Transition>
      {/*  */}
      {/* loading overlay */}
      {/*  */}
      <Transition
        show={queryConfig.isLoading}
        className="absolute inset-0 transition duration-1000 bg-white flex justify-center items-center"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="w-20 h-20 animate-spin rounded-full border-2 border-gray-500 border-top-gray-300 border-left-gray-300" />
      </Transition>
    </div>
  );
}

function CommandItemEditor(props: {
  command: Command;
  status: CommandStatus;
  register: (key: "name" | "command") => UseFormRegisterReturn<string>;
  onDelete: () => void;
}) {
  const { listeners, setNodeRef, transform, transition } = useSortable({
    id: props.command.id,
  });

  return (
    <div
      className="w-full flex items-center gap-2 p-2 border bg-white"
      ref={setNodeRef}
      style={{
        transition,
        transform: `translate(${transform?.x ?? 0}px, ${transform?.y}px)`,
      }}
    >
      <span
        className="flex-none w-5 h-5 flex items-center cursor-pointer"
        {...listeners}
      >
        {props.status === "success" && (
          <CheckCircleIcon className="text-green-500" />
        )}
        {props.status === "error" && (
          <ExclamationTriangleIcon className="text-red-500" />
        )}
        {props.status === "running" && <SunIcon className="text-green-500" />}
        {props.status === "idle" && (
          <MinusCircleIcon className="text-gray-400" />
        )}
      </span>
      <input
        className="px-1 border w-[120px]"
        placeholder="name"
        {...props.register("name")}
      />
      <input
        className="px-1 border flex-1"
        placeholder="command"
        spellCheck={false}
        {...props.register("command")}
      />
      {props.status !== "running" && (
        <button className="px-2 border bg-gray-600 text-white font-bold text-sm self-stretch w-[70px] uppercase filter hover:brightness-85 transition duration-150">
          start
        </button>
      )}
      {props.status === "running" && (
        <button className="px-2 border bg-gray-600 text-white font-bold text-sm self-stretch w-[70px] uppercase filter hover:brightness-85 transition duration-150">
          stop
        </button>
      )}
      {/* TODO: queryLog */}
      {/* <button className="px-2 border bg-gray-600 text-white font-bold text-sm self-stretch w-[50px] uppercase filter hover:brightness-85 transition duration-150">
        log
      </button> */}
      <button
        className="flex items-center filter hover:brightness-130"
        onClick={() => props.onDelete()}
      >
        <XCircleIcon className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
}

function useDocumentEvent<K extends keyof DocumentEventMap>(
  type: K,
  handler: (ev: DocumentEventMap[K]) => any
) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    const handler = (e: DocumentEventMap[K]) => handlerRef.current(e);
    document.addEventListener(type, handler);
    return () => document.removeEventListener(type, handler);
  }, []);
}
