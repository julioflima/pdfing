/* eslint-disable prefer-template */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */

const markdownPdf = require('markdown-pdf');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const remarkClassy = require('remarkable-classy');
const { PDFDocument } = require('pdf-lib');

module.exports = class Doc {
  constructor(docName, data) {
    // Constantes
    this.timestamp = new Date().getTime();
    this.extension = 'html';

    this.nameFileCss = 'style.css';
    this.nameFileRunnings = 'runnings.js';

    this.nameIndexOriginal = `index.${this.extension}`;
    this.nameIndexNew = `index-${this.timestamp}.${this.extension}`;
    this.nameRunningsNew = `runnings-${this.timestamp}.js`;

    this.nameFile = `document-${this.timestamp}.pdf`;
    this.nameFileMerged = `documents-merged-${this.timestamp}.pdf`;

    this.pathRepo = path.join(__dirname, docName);
    this.pathImages = path.join(this.pathRepo, 'images.json');

    this.pathTempPdf = path.join(this.pathRepo, 'tmp', 'pdf');
    this.pathTempIndex = path.join(this.pathRepo, 'tmp', 'index');
    this.pathTempRunnings = path.join(this.pathRepo, 'tmp', 'js');

    this.pathOriginalIndex = path.join(this.pathRepo, this.nameIndexOriginal);
    this.nameOriginalRunnings = path.join(this.pathRepo, this.nameFileRunnings);
    this.pathOriginalCss = path.join(this.pathRepo, this.nameFileCss);

    this.pathNewIndex = path.join(this.pathTempIndex, this.nameIndexNew);
    this.pathNewRunnings = path.join(this.pathTempRunnings, this.nameRunningsNew);
    this.pathNewFile = path.join(this.pathTempPdf, this.nameFile);
    this.pathNewMerged = path.join(this.pathTempPdf, this.nameFileMerged);

    this.config = {
      remarkable: {
        html: true,
        breaks: true,
        plugins: [remarkClassy],
        syntax: ['footnote', 'sup', 'sub'],
      },
      cssPath: this.pathOriginalCss,
      runningsPath: this.pathNewRunnings,
      paperFormat: 'A4',
      paperOrientation: 'portrait',
      paperBorder: '0cm',
    };

    this.status = 'Done!';

    // Variables
    this.data = data;
    this.context = '';
    this.runnings;

    // Objects
    this.images = {};
    this.file = {};

    // Modules
    this.markdownPdf = markdownPdf;
    this.fs = fs;
  }

  async gerarPdf() {
    await this.getImages();

    await this.getRunnings();
    await this.updateRunnigs();
    await this.saveRunnings();

    await this.getIndex();
    await this.updateIndex();
    await this.saveIndex();

    await this.saveFile();

    await this.instanceFile();

    await this.deleteFiles();

    return this.file;
  }

  async combinePdfs(name1, name2) {
    const pdfPath1 = path.join(this.pathTempPdf, `${this.id}-${name1}.pdf`);
    const pdfPath2 = path.join(this.pathTempPdf, `${this.id}-${name2}.pdf`);

    const pdfBuffer1 = fsSync.readFileSync(pdfPath1);
    const pdfBuffer2 = fsSync.readFileSync(pdfPath2);

    const pdfsToMerge = [pdfBuffer1, pdfBuffer2];

    const mergedPdf = await PDFDocument.create();
    for (const pdfBytes of pdfsToMerge) {
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const buffer = await mergedPdf.save();

    await fs.writeFile(this.pathNewMerged, buffer);

    const file = await this.instancePdf(this.pathNewMerged);

    this.deleteFiles([pdfPath1, pdfPath2, this.pathNewMerged]);

    return file;
  }

  async combineBuffers(pdfBuffer1, pdfBuffer2) {
    const pdfsToMerge = [pdfBuffer1, pdfBuffer2];

    const mergedPdf = await PDFDocument.create();
    for (const pdfBytes of pdfsToMerge) {
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const buffer = await mergedPdf.save();

    await fs.writeFile(this.pathNewMerged, buffer);

    await this.instancePdf(this.pathNewMerged);

    await fs.unlink(this.pathNewMerged);

    return this.file;
  }

  async getImages() {
    const jsonString = await fs.readFile(this.pathImages);
    this.images = JSON.parse(jsonString);

    this.data = { ...this.images, ...this.data };
  }

  async getIndex() {
    this.context = await fs.readFile(this.pathOriginalIndex, 'utf8');
  }

  async getRunnings() {
    this.runnings = await fs.readFile(this.nameOriginalRunnings, 'utf8');
  }

  async updateIndex() {
    let updatedContext = this.context;

    const chaves = Object.keys(this.data);
    chaves.forEach((chave) => {
      const etiqueta = `[${chave}]`;
      let value = this.data[chave];
      value = value || '';

      updatedContext = updatedContext.split(etiqueta).join(value);
    });

    this.context = updatedContext;
  }

  async updateRunnigs() {
    let updatedRunnings = this.runnings;

    const chaves = Object.keys(this.data);
    chaves.forEach((chave) => {
      const etiqueta = `[${chave}]`;
      let value = this.data[chave];
      value = value || '';

      updatedRunnings = updatedRunnings.split(etiqueta).join(value);
    });

    this.runnings = updatedRunnings;
  }

  async saveRunnings() {
    await fs.writeFile(this.pathNewRunnings, this.runnings);
  }

  async saveIndex() {
    return fs.writeFile(this.pathNewIndex, this.context);
  }

  async saveFile() {
    return new Promise((resolve) => {
      this.markdownPdf(this.config)
        .from(this.pathNewIndex)
        .to(this.pathNewFile, () => {
          resolve();
        });
    });
  }

  async instancePdf(path) {
    const buffer = await fs.readFile(path);
    const file = fsSync.createReadStream(path);
    const { size } = await fs.stat(path);

    this.file = {
      buffer,
      file,
      size: size,
    };
  }

  async instanceFile() {
    return this.instancePdf(this.pathNewFile);
  }

  async deleteFiles() {
    fs.unlink(this.pathNewRunnings);
    fs.unlink(this.pathNewIndex);
    fs.unlink(this.pathNewFile);
  }
};
