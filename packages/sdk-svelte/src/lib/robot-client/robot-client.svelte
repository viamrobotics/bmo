<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import type { Credentials } from '@viamrobotics/rpc';
  import type { ServiceError } from '@viamrobotics/sdk';

  import { Input, Button, Label, useNotify } from '@viamrobotics/prime-core';

  import {
    useRobotClient,
    getRobotClient,
    type RobotClientOptions,
  } from './use-robot-client';

  export let host: string;
  export let signalingAddress: string;
  export let authEntity = '';
  export let credential: Credentials | undefined = undefined;
  export let supportedAuthTypes: string[] = [];

  const { robotClient } = useRobotClient();
  const notify = useNotify();

  const dispatch = createEventDispatcher<{
    'connection-error': unknown;
  }>();

  $: password = '';
  $: isAuthenticating = false;

  let isConnected = false;
  $: {
    isConnected = Boolean($robotClient?.isConnected());
    console.log('is connected', {
      client: $robotClient,
      isConnected: $robotClient?.isConnected(),
    });
  }

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
    }
  };

  const handleUnload = () => {
    $robotClient?.disconnect();
  };

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
