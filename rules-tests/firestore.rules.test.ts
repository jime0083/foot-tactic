import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'foot-tactic-rules-test',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('firestore.rules', () => {
  it('本人は自分のusersドキュメントを読み書きできる', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(setDoc(doc(alice, 'users/alice'), { displayName: 'Alice' }));
    await assertSucceeds(getDoc(doc(alice, 'users/alice')));
  });

  it('本人は自分のprojectsサブコレクションを読み書きできる', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(setDoc(doc(alice, 'users/alice/projects/p1'), { title: 'test' }));
    await assertSucceeds(getDoc(doc(alice, 'users/alice/projects/p1')));
  });

  it('本人はprojects配下のmemosサブコレクションも読み書きできる', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      setDoc(doc(alice, 'users/alice/projects/p1/memos/m1'), { text: 'メモ' }),
    );
    await assertSucceeds(getDoc(doc(alice, 'users/alice/projects/p1/memos/m1')));
  });

  it('他人のusersドキュメントは読み書きできない', async () => {
    const bob = testEnv.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(bob, 'users/alice')));
    await assertFails(setDoc(doc(bob, 'users/alice'), { displayName: 'hack' }));
  });

  it('他人のprojectsサブコレクションは読み書きできない', async () => {
    const bob = testEnv.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(bob, 'users/alice/projects/p1')));
    await assertFails(setDoc(doc(bob, 'users/alice/projects/p1'), { title: 'hack' }));
  });

  it('他人のmemosサブコレクションは読み書きできない', async () => {
    const bob = testEnv.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(bob, 'users/alice/projects/p1/memos/m1')));
    await assertFails(setDoc(doc(bob, 'users/alice/projects/p1/memos/m1'), { text: 'hack' }));
  });

  it('未ログインでは一切読み書きできない', async () => {
    const anonymous = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymous, 'users/alice')));
    await assertFails(setDoc(doc(anonymous, 'users/alice'), { displayName: 'hack' }));
    await assertFails(getDoc(doc(anonymous, 'users/alice/projects/p1')));
  });

  it('users以外のコレクションには誰もアクセスできない', async () => {
    const alice = testEnv.authenticatedContext('alice').firestore();
    await assertFails(getDoc(doc(alice, 'global/config')));
    await assertFails(setDoc(doc(alice, 'global/config'), { value: 1 }));
  });
});
