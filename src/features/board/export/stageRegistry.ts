import type Konva from 'konva';

/** 現在マウントされているボードのKonva Stage(書き出し用) */
let currentStage: Konva.Stage | null = null;

export function registerStage(stage: Konva.Stage | null): void {
  currentStage = stage;
}

export function getRegisteredStage(): Konva.Stage | null {
  return currentStage;
}
