import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Defines the interface for any action that can be undone.
 * Now includes a 'name' for UI tooltips.
 */
export interface Command { // <-- The 'export' keyword was added here
  name: string;
  execute(): void;
  undo(): void;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  // Observables for the UI to enable/disable buttons
  private canUndo = new BehaviorSubject<boolean>(false);
  private canRedo = new BehaviorSubject<boolean>(false);
  canUndo$ = this.canUndo.asObservable();
  canRedo$ = this.canRedo.asObservable();

  // Observables for the tooltip text
  private undoActionName = new BehaviorSubject<string>('');
  private redoActionName = new BehaviorSubject<string>('');
  undoActionName$ = this.undoActionName.asObservable();
  redoActionName$ = this.redoActionName.asObservable();

  constructor() { }

  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new action
    this.updateButtonState();
  }

  undo(): void {
    if (this.undoStack.length === 0) return;
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.updateButtonState();
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);
    this.updateButtonState();
  }

  private updateButtonState(): void {
    this.canUndo.next(this.undoStack.length > 0);
    this.canRedo.next(this.redoStack.length > 0);

    const nextUndoName = this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].name : '';
    const nextRedoName = this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1].name : '';
    this.undoActionName.next(`Undo ${nextUndoName}`);
    this.redoActionName.next(`Redo ${nextRedoName}`);
  }
}