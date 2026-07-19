import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { getActiveApiKey, loadAiSettings } from '@/features/transcription/aiSettings';
import { RecorderError, useRecorder } from '@/features/transcription/useRecorder';

interface VoiceRecorderButtonProps {
  /** 録音停止後に音声Blobを受け取る(文字起こしへ渡す) */
  onAudioReady: (audio: Blob) => void | Promise<void>;
  disabled?: boolean;
}

/** 音声メモの録音ボタン(押して録音→停止で音声を確定) */
export function VoiceRecorderButton({ onAudioReady, disabled = false }: VoiceRecorderButtonProps) {
  const { t } = useTranslation();
  const { status, start, stop } = useRecorder();
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setErrorMessage(null);
    if (status === 'recording') {
      const audio = await stop();
      await onAudioReady(audio);
      return;
    }
    // APIキー未登録の場合は設定画面へ誘導する(要件VOICE-5)
    const settings = loadAiSettings();
    if (getActiveApiKey(settings) === '') {
      setShowKeyGuide(true);
      return;
    }
    setShowKeyGuide(false);
    try {
      await start();
    } catch (error) {
      if (error instanceof RecorderError && error.kind === 'permission') {
        setErrorMessage(t('memo.voice.permissionDenied'));
      } else if (error instanceof RecorderError && error.kind === 'unsupported') {
        setErrorMessage(t('memo.voice.unsupported'));
      } else {
        console.error('録音の開始に失敗しました', error);
        setErrorMessage(t('memo.voice.failed'));
      }
    }
  };

  return (
    <div className="voice-recorder">
      <button
        type="button"
        disabled={disabled}
        className={status === 'recording' ? 'voice-recorder__button--recording' : undefined}
        onClick={() => void handleClick()}
      >
        {status === 'recording' ? t('memo.voice.stop') : t('memo.voice.record')}
      </button>
      {status === 'recording' && <span role="status">{t('memo.voice.recording')}</span>}
      {showKeyGuide && (
        <span role="alert">
          {t('memo.voice.keyMissing')} <Link to="/settings">{t('memo.voice.goSettings')}</Link>
        </span>
      )}
      {errorMessage && <span role="alert">{errorMessage}</span>}
    </div>
  );
}
