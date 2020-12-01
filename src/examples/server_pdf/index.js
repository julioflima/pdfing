const Pdfing = require('pdfing');
const path = require('path');

const { Routes, App } = require('./app');
const data = require('./data');

const controller = async (req, res) => {
  try {
    const pdfPath = path.resolve('./report');

    const doc = new Pdfing(
      {
        path: pdfPath,
        paperFormat: 'A4',
        heightHeader: '1.8cm',
        heightFooter: '1.5cm',
        notDeleteFiles: false, // If you wanna see the document inside "report/tmp/pdf" change this to true.
      },
      data
    );

    const { file, size } = await doc.get();

    res.setHeader('Content-Length', size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Report.pdf');

    return file.pipe(res);
  } catch (err) {
    return res.status(500).send({
      error: true,
      debug: err.stack,
      message: 'Oops, something wrong happen. Sorry!',
      message_debug: err.message,
    });
  }
};

const routes = new Routes(controller);
const app = new App(routes).server;

app.listen(3000);

console.log('Access the URL in below to generate the pdf.');
console.log('http://localhost:3000/pdfing');

// To see the document, access the URL in below:
// http://localhost:3000/pdfing
