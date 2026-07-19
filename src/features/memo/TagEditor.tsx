import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { MEMO_TAG_MAX_LENGTH } from './memoTypes';

interface TagEditorProps {
  tags: readonly string[];
  /** 過去に使ったタグのサジェスト候補 */
  suggestions: readonly string[];
  /** アクセシブルネームの区別用ラベル */
  label: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

/** タグ(見出し)のチップ表示+自由入力エディタ。datalistでサジェストを出す */
export function TagEditor({ tags, suggestions, label, onAdd, onRemove }: TagEditorProps) {
  const { t } = useTranslation();
  const datalistId = useId();

  return (
    <div className="tag-editor">
      {tags.map((tag) => (
        <span key={tag} className="tag-editor__chip">
          {tag}
          <button
            type="button"
            aria-label={`${t('memo.removeTag')}: ${tag}`}
            onClick={() => onRemove(tag)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        list={datalistId}
        maxLength={MEMO_TAG_MAX_LENGTH}
        className="tag-editor__input"
        placeholder={t('memo.tagPlaceholder')}
        aria-label={`${t('memo.addTag')}: ${label}`}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.currentTarget;
            const tag = input.value.trim();
            if (tag !== '' && !tags.includes(tag)) {
              onAdd(tag);
            }
            input.value = '';
          }
        }}
      />
      <datalist id={datalistId}>
        {suggestions
          .filter((suggestion) => !tags.includes(suggestion))
          .map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
      </datalist>
    </div>
  );
}
