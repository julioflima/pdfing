module.exports = class Process {
  constructor(data) {
    this.data = data;

    return this.process();
  }

  process() {
    return this.data;
  }
};
