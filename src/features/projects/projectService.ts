import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SportType } from '@/features/board/field/fieldSpec';
import {
  createInitialSnapshot,
  normalizeSnapshot,
  type BoardSnapshot,
  type ProjectData,
  type ProjectMeta,
} from './projectTypes';

function projectsCollection(uid: string) {
  return collection(db, 'users', uid, 'projects');
}

function projectDoc(uid: string, projectId: string) {
  return doc(db, 'users', uid, 'projects', projectId);
}

function toMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null;
}

/** 新規プロジェクトを作成し、IDを返す */
export async function createProject(
  uid: string,
  title: string,
  sportType: SportType,
): Promise<string> {
  const snapshot = createInitialSnapshot(sportType);
  const reference = await addDoc(projectsCollection(uid), {
    title,
    tags: [],
    ...snapshot,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

/** プロジェクトを読み込む。存在しない場合はnull */
export async function loadProject(uid: string, projectId: string): Promise<ProjectData | null> {
  const snapshot = await getDoc(projectDoc(uid, projectId));
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  return {
    meta: {
      id: snapshot.id,
      title: typeof data.title === 'string' ? data.title : '',
      tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === 'string') : [],
      sportType: (data.sportType as SportType) ?? 'soccer11',
      updatedAt: toMillis(data.updatedAt),
    },
    snapshot: normalizeSnapshot(data),
  };
}

/** ボード内容を保存する */
export async function saveProjectSnapshot(
  uid: string,
  projectId: string,
  snapshot: BoardSnapshot,
): Promise<void> {
  await setDoc(
    projectDoc(uid, projectId),
    { ...snapshot, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** タイトル・タグなどメタ情報を更新する */
export async function updateProjectMeta(
  uid: string,
  projectId: string,
  meta: Partial<Pick<ProjectMeta, 'title' | 'tags'>>,
): Promise<void> {
  await setDoc(
    projectDoc(uid, projectId),
    { ...meta, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** プロジェクト一覧を取得する(Phase4.3で使用) */
export async function listProjects(uid: string): Promise<ProjectMeta[]> {
  const result = await getDocs(projectsCollection(uid));
  return result.docs
    .map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        title: typeof data.title === 'string' ? data.title : '',
        tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === 'string') : [],
        sportType: (data.sportType as SportType) ?? 'soccer11',
        updatedAt: toMillis(data.updatedAt),
      };
    })
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/** プロジェクトを削除する(Phase4.3で使用) */
export async function deleteProject(uid: string, projectId: string): Promise<void> {
  await deleteDoc(projectDoc(uid, projectId));
}
