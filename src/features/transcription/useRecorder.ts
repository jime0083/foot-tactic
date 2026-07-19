import { useCallback, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording';

export type RecorderErrorKind = 'permission' | 'unsupported' | 'unknown';

export class RecorderError extends Error {
  readonly kind: RecorderErrorKind;

  constructor(kind: RecorderErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

/** ブラウザがサポートする録音用MIMEタイプを選ぶ */
export function pickAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/** マイク録音フック(MediaRecorderラッパー) */
export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      throw new RecorderError('unsupported', 'このブラウザは録音に対応していません');
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      const name = (error as DOMException | null)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        throw new RecorderError('permission', 'マイクの使用が許可されていません');
      }
      throw new RecorderError('unknown', 'マイクの取得に失敗しました');
    }
    const mimeType = pickAudioMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    recorder.start();
    recorderRef.current = recorder;
    streamRef.current = stream;
    setStatus('recording');
  }, []);

  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        reject(new RecorderError('unknown', '録音が開始されていません'));
        return;
      }
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setStatus('idle');
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      };
      recorder.stop();
    });
  }, []);

  return { status, start, stop };
}
