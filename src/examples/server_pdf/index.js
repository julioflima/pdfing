const Pdfing = require('pdfing');

const { Routes, App } = require('./server');
const data = require('./data');

const controller = (req,res)=>{
  try {

    const { file, size } = await new Pdfing.get(data);

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
}


const routes = new Routes(controller);
const app = new App(routes).server;

app.listen(3000);

// To see the document, access the URL in below:
// http://localhost:3000/pdfing
