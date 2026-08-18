import resizingNum from './ResizingNum';

class OperationQueue {
  constructor(processAfterLastOperationMs = 300) {
    this.queue = [];
    this.timeoutId = null;
    this.processAfterLastOperationMs = processAfterLastOperationMs;
    this.isFrozen = false; // New state to track if the queue is frozen
  }

  addOperation(operation) {
    this.queue.push(operation);
    if (!this.isFrozen) { // Only restart the timer if not frozen
      this.restartTimer();
    }
  }

  restartTimer() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      if (!this.isFrozen) { // Check again in case the queue was frozen before the timer expired
        this.processOperations();
      }
    }, this.processAfterLastOperationMs);
  }

  processOperations() {
    if (resizingNum.get() === 1) {
      return;
    }
    // Execute all operations in the queue
    this.queue.forEach(operation => operation());
    // Clear the queue after processing
    this.queue = [];
  }

  freeze() {
    this.isFrozen = true; // Prevent new operations from being processed
    clearTimeout(this.timeoutId); // Cancel any pending timer
  }

  unfreeze() {
    this.isFrozen = false; // Allow operations to be processed again
    // Optionally restart the timer to process operations after unfreezing
    if (this.queue.length > 0) {
      this.restartTimer();
    }
  }
}

// Initialize the operation queue
const operationQueue = new OperationQueue(500); // Adjust delay as needed

export default operationQueue;