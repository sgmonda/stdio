import { Readable } from 'stream';

class ReadableString extends Readable {
  private sent = false;
  constructor(private str: string) {
    super();
  }
  public _read(): void {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}

export default ReadableString;
