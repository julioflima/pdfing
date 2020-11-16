const Doc = require('./Doc');
const Process = require('./Process');

module.exports = class Pdfing {
  constructor(options, data) {
    this.options = options;
    this.data = data;

    this.Doc = Doc;
    this.Process = Process;

    return this.init();
  }

  init() {
    const processedData = new this.Process(this.data);
    const pdf = new this.Doc(this.options, processedData);

    return pdf;
  }
};
