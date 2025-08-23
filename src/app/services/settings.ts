import { Injectable } from '@angular/core';

export type TimeFormat = '24h' | '12h';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private key = 'app.timeFormat';
  private _timeFormat: TimeFormat = '24h';

  load() {
    const v = localStorage.getItem(this.key);
    if (v === '12h' || v === '24h') this._timeFormat = v as TimeFormat;
  }

  get timeFormat(): TimeFormat { return this._timeFormat; }

  setTimeFormat(fmt: TimeFormat) {
    this._timeFormat = fmt;
    localStorage.setItem(this.key, fmt);
  }
}
