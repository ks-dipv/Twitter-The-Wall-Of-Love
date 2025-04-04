export class SuccessDto {
  private success: boolean;
  private meassage: string;

  constructor(message) {
    this.success = true;
    this.meassage = message;
  }
}
