<script lang="ts">
  import { useInterval, useTimeout } from '$lib/svelte';
  import { noopCanceller, scheduleInterval, scheduleTimeout } from '$lib';
  import { onMount } from 'svelte';

  const { schedule } = useTimeout();
  const interval = useInterval();

  let cancelDelay = noopCanceller;
  let cancelTimer = noopCanceller;

  $: timeoutText = 'will change';
  $: intervalCount = 0;
  $: delayText = '';
  $: seconds = 0;

  onMount(() => {
    schedule(() => (timeoutText = 'has changed'), 10000);
    cancelDelay = scheduleTimeout(() => (delayText = 'Surprise!'), 5000);

    $interval.schedule(() => (intervalCount += 1), 3000);
    cancelTimer = scheduleInterval(() => (seconds += 1), 1000);
  });
</script>

<h1>Timeout</h1>

<p>
  This text {timeoutText} after 10 seconds.
</p>

<div>
  <p>If you don't like surprises, press the button:</p>
  {#if delayText}
    <h2>{delayText}</h2>
  {:else}
    <button on:click={cancelDelay}>Cancel Surpise</button>
  {/if}
</div>

<h1>Interval</h1>

<p>
  This count will increase by 1 every 3 seconds: {intervalCount}
</p>

<button on:click={$interval.cancel}>Cancel Interval</button>

<div>
  <p>Time spent on the page: {seconds} seconds</p>
  <button on:click={cancelTimer}>Stop</button>
</div>
