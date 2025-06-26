
// Define interfaces for the data structures
interface DataStruct {
  // Add specific fields as needed
  [key: string]: unknown;
}

export async function _GSPS2PDF(
  dataStruct: DataStruct,
): Promise<unknown> {
  const worker = new Worker(
    new URL('./background-worker.js', import.meta.url),
    {type: 'module'}
  );
  worker.postMessage({ data: dataStruct, target: 'wasm'});
  return new Promise<unknown>((resolve) => {
    const listener = (e: MessageEvent) => {
      resolve(e.data);
      worker.removeEventListener('message', listener);
      setTimeout(() => worker.terminate(), 0);
    }
    worker.addEventListener('message', listener);
  });
}


