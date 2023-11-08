<script lang="ts">
  import { isBrowser } from '$lib';
  import { onMount } from 'svelte';

  console.log('Are we in the browser at the script root?', isBrowser);

  onMount(() => console.log('Are we in the browser on mount?', isBrowser));
</script>

<h1>Browser</h1>

Are we in the browser? {isBrowser ? 'Yes' : 'No'}.
