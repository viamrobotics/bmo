import { get, writable } from 'svelte/store';
import {
  type RobotClient,
  createRobotClient,
  type DialWebRTCConf,
} from '@viamrobotics/sdk';

const context = {
  robotClient: writable<RobotClient | undefined>(),
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
