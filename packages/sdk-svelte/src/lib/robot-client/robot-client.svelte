<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { ConnectionClosedError, type Credentials } from '@viamrobotics/rpc';
  import type { robotApi, ServiceError } from '@viamrobotics/sdk';

  import { Input, Button, Label, useNotify } from '@viamrobotics/prime-core';

  import {
    useAsyncInterval,
    useTimeout,
  } from '@viamrobotics/schedulers/svelte';

  import { getResourceNameString } from '$lib/resource-name';

  import {
    useRobotClient,
    getRobotClient,
    type RobotClientOptions,
    getResourceNames,
  } from './use-robot-client';

  export let host: string;
  export let signalingAddress: string;
  export let authEntity = '';
  export let credential: Credentials | undefined = undefined;
  export let supportedAuthTypes: string[] = [];
  export let enablePolling = true;

  const { robotClient, statusStream, statuses, components } = useRobotClient();

  const initializeTimeout = useTimeout();
  const pollInterval = useAsyncInterval();

  const notify = useNotify();

  const dispatch = createEventDispatcher<{
    'connection-error': unknown;
  }>();

  let password = '';
  let hasLoadedResources = false;

  $: isAuthenticating = false;

  let isConnected = false;
  $: {
    isConnected = Boolean($robotClient?.isConnected());
    console.log('is connected', {
      client: $robotClient,
      isConnected: $robotClient?.isConnected(),
    });
  }

  const updateStatus = (grpcStatuses: robotApi.Status[]) => {
    for (const grpcStatus of grpcStatuses) {
      const nameObj = grpcStatus.getName()?.toObject();
      if (!nameObj) {
        continue;
      }

      const status = grpcStatus.getStatus()?.toJavaScript();
      if (!status) {
        continue;
      }

      const name = getResourceNameString(nameObj);
      $statuses[name] = status;
    }
  };

  const restartStatusStream = async () => {
    if ($statusStream) {
      $statusStream.cancel();
    }

    if (!$robotClient) {
      return;
    }

    $statusStream = $robotClient.streamStatus($components);

    $statusStream.on('data', (message: robotApi.Status[]) =>
      updateStatus(message)
    );

    $statusStream.on('status', (newStatus?: { details: unknown }) => {
      if (!ConnectionClosedError.isError(newStatus!.details)) {
        // eslint-disable-next-line no-console
        console.error('error streaming robot status', newStatus);
      }
    });

    $statusStream.on('end', () => {
      // eslint-disable-next-line no-console
      console.error('done streaming robot status');
    });
  };

  const pollResources = async (): Promise<void> => {
    if (!$robotClient) {
      return;
    }

    try {
      const { hasChanges } = await getResourceNames();

      let shouldRestartStatusStream = !hasLoadedResources;
      hasLoadedResources = true;

      if (shouldRestartStatusStream || hasChanges) {
        restartStatusStream();
      }
    } catch (error) {
      console.error(['error polling resources', error]);
    }
  };

  const stop = () => {
    $pollInterval.cancel();
    $statusStream.cancel();
  };

  const start = async () => {
    stop();
    $pollInterval.schedule(pollResources, 5000);
  };

  const connect = async (creds?: Credentials) => {
    if (!$robotClient) {
      const options: RobotClientOptions = {
        host,
        signalingAddress,
        authEntity,
      };

      if (creds) {
        options.credential = creds;
      } else if (credential) {
        options.credential = credential;
      }

      await getRobotClient(options);
      return;
    }

    if (enablePolling) {
      start();
    }
  };

  const authenticate = async (authType: string) => {
    const creds = { type: authType, payload: password };
    isAuthenticating = true;

    try {
      await connect(creds);
    } catch (error) {
      console.error('failed to log in', error);
      notify.danger(
        `Unable to authenticate with ${authType}: ${
          (error as ServiceError).message
        }`
      );
    } finally {
      isAuthenticating = false;
    }
  };

  const initialize = async () => {
    try {
      await connect();
    } catch (error) {
      dispatch('connection-error', error);
      initializeTimeout.schedule(initialize, 100);
    }
  };

  const handleUnload = () => {
    stop();
    $robotClient?.disconnect();
  };

  $: enablePolling ? start() : stop();

  onMount(async () => {
    window.addEventListener('beforeunload', handleUnload);

    if (supportedAuthTypes.length === 0) {
      initialize();
    }
  });

  onDestroy(() => {
    handleUnload();
    window.removeEventListener('beforeunload', handleUnload);
  });
</script>

{#if $robotClient === undefined}
  <slot name="connecting" />
{:else if !isConnected}
  <slot name="reconnecting" />
{/if}

{#if isConnected}
  <slot />
{:else}
  {#each supportedAuthTypes as authType (authType)}
    <div class="px-4 py-3 w-96 flex flex-col gap-2">
      <Label>
        {authType}:

        <Input
          bind:value={password}
          slot="input"
          disabled={isAuthenticating}
          type="password"
          autocomplete="off"
          on:keydown={async (event) =>
            event.key === 'Enter' && authenticate(authType)}
        />
      </Label>

      <Button
        disabled={isAuthenticating}
        on:click={() => authenticate(authType)}
      >
        Login
      </Button>
    </div>
  {/each}
{/if}
