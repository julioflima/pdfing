const Pdf = require('./class/Pdf');
const Process = require('./class/Process');

module.exports = class Pdfing {
  constructor(options, data) {
    this.options = options;
    this.data = data;

    this.Pdf = Pdf;
    this.Process = Process;

    return this.init();
  }

  init() {
    const processedData = new this.Process(this.data);
    const pdf = new this.Pdf(this.options, processedData);

    return pdf;
  }
};
