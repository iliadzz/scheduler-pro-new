import { Command } from './history.service';
import { ScheduleService } from './schedule';
import { ShiftAssignment, DaySchedule } from '../models/schedule.model';

export class MoveOrCopyAssignmentCommand implements Command {
  public readonly name: string; // <-- FIX: Add the 'name' property

  constructor(
    private scheduleService: ScheduleService,
    private assignment: ShiftAssignment,
    private fromUserId: string,
    private fromDate: Date,
    private toUserId: string,
    private toDate: Date,
    private mode: 'move' | 'copy'
  ) {
    // FIX: Set the name in the constructor
    this.name = mode === 'copy' ? 'Copy Shift' : 'Move Shift';
  }

  execute(): void {
    this.scheduleService.moveOrCopyAssignment(
      this.assignment, this.fromUserId, this.fromDate,
      this.toUserId, this.toDate, this.mode
    ).subscribe();
  }

  undo(): void {
    if (this.mode === 'move') {
      this.scheduleService.moveOrCopyAssignment(
        this.assignment, this.toUserId, this.toDate,
        this.fromUserId, this.fromDate, 'move'
      ).subscribe();
    } else {
      console.warn("Undo for 'copy' operation not fully implemented yet.");
    }
  }
}

export class ClearWeekCommand implements Command {
  public readonly name = 'Clear Week'; // <-- FIX: Add the 'name' property
  private deletedShifts: Map<string, DaySchedule> = new Map();

  constructor(
    private scheduleService: ScheduleService,
    private userIds: string[],
    private weekDates: Date[]
  ) {}

  execute(): void {
    this.scheduleService.getScheduleForUsersAndDates(this.userIds, this.weekDates)
      .subscribe(shiftsToClear => {
        this.deletedShifts = shiftsToClear;
        this.scheduleService.clearWeek(this.userIds, this.weekDates).subscribe();
      });
  }

  undo(): void {
    this.scheduleService.restoreShifts(this.deletedShifts).subscribe();
  }
}