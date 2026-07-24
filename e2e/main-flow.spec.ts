import { test, expect, type Page } from '@playwright/test';

/**
 * Firebase Auth Emulatorのポップアップで新規Googleアカウントを作成してログインする。
 * Emulatorのサインインウィジェットを操作する。
 */
async function signInWithEmulator(page: Page) {
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Googleでログイン' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();

  // 既存アカウントがあれば「Add new account」、なければ直接フォームが表示される
  const addButton = popup.getByRole('button', { name: /Add new account/i });
  if (await addButton.isVisible().catch(() => false)) {
    await addButton.click();
  }
  await popup.getByText(/Auto-generate user information/i).click();
  await popup.getByRole('button', { name: /Sign in with Google\.com/i }).click();
}

test('主要フロー: ログイン→ボード作成→メモ→PNG書き出し', async ({ page }) => {
  await page.goto('/login');

  // Googleログイン(Auth Emulator)
  await signInWithEmulator(page);
  await expect(page.getByRole('heading', { name: 'プロジェクト一覧' })).toBeVisible();

  // 新規プロジェクト作成
  await page.getByLabel('プロジェクト名').fill('E2Eテスト試合');
  await page.getByRole('button', { name: '新規作成' }).click();

  // ボード画面が表示される
  await expect(page.getByTestId('board-canvas')).toBeVisible();

  // メモ追加(メモエリア内の入力欄と追加ボタンを特定)
  const memoArea = page.getByRole('region', { name: 'メモ' });
  await memoArea.getByLabel(/メモを入力/).fill('E2Eメモ: 前半に決定機');
  await memoArea.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText('E2Eメモ: 前半に決定機')).toBeVisible();

  // 設定タブを開いてPNG書き出し(ダウンロードの発火とファイル名を検証)
  await page.getByRole('tab', { name: '設定' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'PNG書き出し' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('オブジェクトの配置・クリック選択・削除ができる', async ({ page }) => {
  await page.goto('/login');
  await signInWithEmulator(page);
  await expect(page.getByRole('heading', { name: 'プロジェクト一覧' })).toBeVisible();
  await page.getByLabel('プロジェクト名').fill('操作テスト');
  await page.getByRole('button', { name: '新規作成' }).click();
  await expect(page.getByTestId('board-canvas')).toBeVisible();

  const stage = page.locator('.board-canvas__stage');
  await expect(stage).toBeVisible();
  const box = await stage.boundingBox();
  if (!box) {
    throw new Error('stage bounding box not found');
  }
  const center = { x: box.width / 2, y: box.height / 2 };

  const toolbar = page.getByRole('toolbar', { name: 'ツール' });
  const deleteButton = toolbar.getByRole('button', { name: '削除', exact: true });

  // ボールツールでフィールド中央に配置
  await toolbar.getByRole('button', { name: 'ボール', exact: true }).click();
  await stage.click({ position: center });

  // 選択ツールに切り替え。未選択なので削除ボタンは無効
  await toolbar.getByRole('button', { name: '選択', exact: true }).click();
  await expect(deleteButton).toBeDisabled();

  // 配置したボールをクリックして選択(setPointerCapture修正でクリック選択が動作する)
  await stage.click({ position: center });
  await expect(deleteButton).toBeEnabled();

  // 削除すると再び未選択状態になる
  await deleteButton.click();
  await expect(deleteButton).toBeDisabled();
});

test('選手を選択すると編集欄が表示され削除できる', async ({ page }) => {
  await page.goto('/login');
  await signInWithEmulator(page);
  await expect(page.getByRole('heading', { name: 'プロジェクト一覧' })).toBeVisible();
  await page.getByLabel('プロジェクト名').fill('選手編集テスト');
  await page.getByRole('button', { name: '新規作成' }).click();
  await expect(page.getByTestId('board-canvas')).toBeVisible();

  const stage = page.locator('.board-canvas__stage');
  await expect(stage).toBeVisible();
  const box = await stage.boundingBox();
  if (!box) {
    throw new Error('stage bounding box not found');
  }
  const center = { x: box.width / 2, y: box.height / 2 };

  const toolbar = page.getByRole('toolbar', { name: 'ツール' });

  // 選手を配置
  await toolbar.getByRole('button', { name: '選手', exact: true }).click();
  await stage.click({ position: center });

  // 選択して背番号の編集欄が表示されることを確認
  await toolbar.getByRole('button', { name: '選択', exact: true }).click();
  await stage.click({ position: center });
  await expect(page.getByRole('textbox', { name: '背番号', exact: true })).toBeVisible();

  // 削除できることを確認
  const deleteButton = toolbar.getByRole('button', { name: '削除', exact: true });
  await expect(deleteButton).toBeEnabled();
  await deleteButton.click();
  await expect(deleteButton).toBeDisabled();
});

test('マーカーは中央クリックで選択でき削除できる', async ({ page }) => {
  await page.goto('/login');
  await signInWithEmulator(page);
  await expect(page.getByRole('heading', { name: 'プロジェクト一覧' })).toBeVisible();
  await page.getByLabel('プロジェクト名').fill('マーカー削除テスト');
  await page.getByRole('button', { name: '新規作成' }).click();
  await expect(page.getByTestId('board-canvas')).toBeVisible();

  const stage = page.locator('.board-canvas__stage');
  await expect(stage).toBeVisible();
  const box = await stage.boundingBox();
  if (!box) {
    throw new Error('stage bounding box not found');
  }
  const center = { x: box.width / 2, y: box.height / 2 };

  const toolbar = page.getByRole('toolbar', { name: 'ツール' });
  const deleteButton = toolbar.getByRole('button', { name: '削除', exact: true });

  // マーカーを中央に配置
  await toolbar.getByRole('button', { name: 'マーカー', exact: true }).click();
  await stage.click({ position: center });

  // 選択ツールでマーカーの中央(リングの内側)をクリックして選択できる(透明塗りで内部がヒットする)
  await toolbar.getByRole('button', { name: '選択', exact: true }).click();
  await expect(deleteButton).toBeDisabled();
  await stage.click({ position: center });
  await expect(deleteButton).toBeEnabled();

  // 削除できる
  await deleteButton.click();
  await expect(deleteButton).toBeDisabled();
});
