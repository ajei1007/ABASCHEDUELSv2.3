// Utility to yield to the main thread to avoid blocking the UI
export async function yieldToMainThread() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
