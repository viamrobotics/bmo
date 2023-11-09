import { onDestroy } from 'svelte';
import { derived, get, writable } from 'svelte/store';
import type { JavaScriptValue } from 'google-protobuf/google/protobuf/struct_pb';
import {
  type RobotClient,
  type RobotStatusStream,
  createRobotClient,
  type DialWebRTCConf,
  commonApi,
} from '@viamrobotics/sdk';

const NOOP_STREAM: RobotStatusStream = {
  cancel: () => ({}),
  on: () => NOOP_STREAM,
};

const resourceNames = writable<commonApi.ResourceName.AsObject[]>([]);

const context = {
  robotClient: writable<RobotClient | undefined>(),
  statusStream: writable<RobotStatusStream>(NOOP_STREAM),
  statuses: writable<Record<string, JavaScriptValue>>({}),
  resourceNames,
  components: derived(resourceNames, (values) =>
    values.filter(({ type }) => type === 'component')
  ),
  services: derived(resourceNames, (values) =>
    values.filter(({ type }) => type === 'service')
  ),
} as const;

export type RobotClientOptions = Pick<
  DialWebRTCConf,
  'host' | 'signalingAddress' | 'authEntity' | 'credential'
>;

export const getRobotClient = async (
  options: RobotClientOptions
): Promise<RobotClient> => {
  const stored = get(context.robotClient);
  if (!stored) {
    const { port, protocol, hostname } = location;
    const urlPort = port ? `:${port}` : '';
    const impliedURL = `${protocol}//${hostname}${urlPort}`;

    const client = await createRobotClient({
      ...options,
      host: options.host || impliedURL,
      iceServers: [
        {
          urls: 'stun:global.stun.twilio.com:3478',
        },
      ],
    });

    context.robotClient.set(client);
    return client;
  }

  return stored;
};

export const useRobotClient = () => {
  return context;
};

/**
 * This hook will fire whenever a connection occurs.
 */
export const useConnect = (callback: () => void) => {
  const { robotClient } = useRobotClient();

  const unsub = robotClient.subscribe((value) => {
    if (value?.isConnected()) {
      callback();
    }
  });

  onDestroy(() => unsub());
};

/**
 * This hook will fire whenever a disconnect occurs or when a component unmounts.
 */
export const useDisconnect = (callback: () => void) => {
  const { statusStream } = useRobotClient();

  statusStream.subscribe((update) => update.on('end', callback));

  onDestroy(callback);
};
