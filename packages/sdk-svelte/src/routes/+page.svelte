<script lang="ts">
  import {
    Banner,
    CodeSnippet,
    NotificationContainer,
    provideNotify,
  } from '@viamrobotics/prime-core';
  import type { Credentials } from '@viamrobotics/rpc';

  import { useRobotClient } from '$lib/robot-client/use-robot-client';
  import RobotClient from '$lib/robot-client/robot-client.svelte';

  import '@viamrobotics/prime-core/prime.css';

  const { statuses, components, services } = useRobotClient();

  let host: string = 'http://localhost:8080';
  let signalingAddress: string = '';
  let authEntity = '';
  let credential: Credentials | undefined = undefined;
  let supportedAuthTypes: string[] = [];
  let enablePolling = true;

  provideNotify();
</script>

<NotificationContainer />
<RobotClient
  {host}
  {signalingAddress}
  {authEntity}
  {credential}
  {supportedAuthTypes}
  {enablePolling}
>
  <Banner
    slot="connecting"
    variant="info"
  >
    <svelte:fragment slot="title">Connecting ...</svelte:fragment>
  </Banner>

  <Banner
    slot="reconnecting"
    variant="danger"
  >
    <svelte:fragment slot="title">
      Connection lost, attempting to reconnect ...
    </svelte:fragment>
  </Banner>

  <CodeSnippet
    language="json"
    code={`${statuses}`}
  >
    <svelte:fragment slot="caption">Statuses</svelte:fragment>
  </CodeSnippet>

  <CodeSnippet
    language="json"
    code={`${components}`}
  >
    <svelte:fragment slot="caption">Components</svelte:fragment>
  </CodeSnippet>

  <CodeSnippet
    language="json"
    code={`${services}`}
  >
    <svelte:fragment slot="caption">Services</svelte:fragment>
  </CodeSnippet>
</RobotClient>
