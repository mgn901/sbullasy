import { fileTypeFromStream } from 'file-type';

export const getMimeTypeFromStream = async (
  stream: ReadableStream<Uint8Array>,
): Promise<string | undefined> => {
  const result = await fileTypeFromStream(stream);
  return result?.mime;
};

export const consumeStream = async (params: {
  readonly stream: ReadableStream<Uint8Array>;
  readonly uint8Array: Uint8Array;
  readonly eventTarget?: EventTarget | undefined;
  readonly abortController?: AbortController | undefined;
}): Promise<void> => {
  const reader = params.stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done === true || params.abortController?.signal.aborted === true) {
      reader.cancel();
      params.eventTarget?.dispatchEvent(new Event('done'));
      break;
    }
    params.uint8Array.set(value, params.uint8Array.length);
    params.eventTarget?.dispatchEvent(new Event('pushed'));
  }
};

export const streamToUint8Array = (params: {
  readonly stream: ReadableStream<Uint8Array>;
  readonly eventTarget?: EventTarget | undefined;
  readonly abortController?: AbortController | undefined;
}): Uint8Array => {
  const uint8Array = new Uint8Array();
  consumeStream({
    stream: params.stream,
    uint8Array,
    eventTarget: params.eventTarget,
    abortController: params.abortController,
  }).then(() => {});
  return uint8Array;
};
