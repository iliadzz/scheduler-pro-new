import { Command } from './history.service';
import { ScheduleService } from './schedule';
import { ShiftAssignment } from '../models/schedule.model';

export class MoveOrCopyAssignmentCommand implements Command {
  constructor(
    private scheduleService: ScheduleService,
    private assignment: ShiftAssignment,
    private fromUserId: string,
    private fromDate: Date,
    private toUserId: string,
    private toDate: Date,
    private mode: 'move' | 'copy'
  ) {}

  execute(): void {
    this.scheduleService.moveOrCopyAssignment(
      this.assignment,
      this.fromUserId, this.fromDate,
      this.toUserId, this.toDate,
      this.mode
    ).subscribe();
  }

  undo(): void {
    // To undo a move, we simply move it back.
    // To undo a copy, we need a way to delete the copied item.
    // For now, we'll focus on the 'move' undo. A full copy-undo is more complex.
    if (this.mode === 'move') {
      this.scheduleService.moveOrCopyAssignment(
        this.assignment,
        this.toUserId, this.toDate,     // "from" and "to" are swapped
        this.fromUserId, this.fromDate,
        'move' // Always a move when undoing
      ).subscribe();
    } else {
        // A more robust implementation for undoing a 'copy' would be to
        // get the new assignmentId from the service and then call delete.
        // For now, we'll log a message.
        console.warn("Undo for 'copy' operation not fully implemented yet.");
    }
  }
}