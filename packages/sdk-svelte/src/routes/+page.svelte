<script lang="ts">
  import {
    Banner,
    NotificationContainer,
    provideNotify,
  } from '@viamrobotics/prime-core';
  import type { Credentials } from '@viamrobotics/rpc';

  import RobotClient from '$lib/robot-client/robot-client.svelte';

  import '@viamrobotics/prime-core/prime.css';

  let host: string = 'http://localhost:8080';
  let signalingAddress: string = '';
  let authEntity = '';
  let credential: Credentials | undefined = undefined;
  let supportedAuthTypes: string[] = [];

  provideNotify();
</script>

<NotificationContainer />
<RobotClient
  {host}
  {signalingAddress}
  {authEntity}
  {credential}
  {supportedAuthTypes}
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
</RobotClient>
