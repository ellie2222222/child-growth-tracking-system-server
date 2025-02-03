import getLogger from "./logger";

const logger = getLogger("PROGRESS");

export class ProgressBar {
  private total: number;
  private processed: number;

  constructor(total: number) {
    this.total = total;
    this.processed = 0;
  }

  update() {
    this.processed++;
    const progress = (this.processed / this.total) * 100;
    const barLength = 50;
    const filledLength = Math.round((progress / 100) * barLength);
    const bar = "█".repeat(filledLength) + "-".repeat(barLength - filledLength);
    process.stdout.write(
      `\rProgress: [${bar}] ${progress.toFixed(2)}% (${this.processed}/${this.total})`
    );
  }

  complete(inserted: number, updated: number) {
    logger.info(
      `\nProcessing completed! ✅ Inserted: ${inserted}, Updated: ${updated}`
    );
  }
}
