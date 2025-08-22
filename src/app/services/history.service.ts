import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Defines the interface for any action that can be undone.
 */
export interface Command {
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

  constructor() { }

  /**
   * Executes a command and pushes it to the undo stack.
   */
  execute(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clearing redo stack on new action
    this.updateButtonState();
  }

  /**
   * Undoes the last command.
   */
  undo(): void {
    if (this.undoStack.length === 0) return;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.updateButtonState();
  }

  /**
   * Redoes the last undone command.
   */
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
  }
}