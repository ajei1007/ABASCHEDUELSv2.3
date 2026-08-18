class ResizingNum {
  constructor() {
    this.num = 0;
  }

  increment() {
    this.num++
  }
  decrement() {
    this.num = 0
  }
  get() {
    return this.num
  }
}

const resizingNum = new ResizingNum();
export default resizingNum;