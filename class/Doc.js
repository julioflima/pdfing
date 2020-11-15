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
  constructor(options, data) {
    // Get params.
    this.path = options.path;
    this.paperFormat = options.paperFormat || 'A4';
    this.heightHeader = options.heightHeader || '2cm';
    this.heightFooter = options.heightFooter || '2cm';
    this.notDeleteFiles = options.notDeleteFiles || false;

    this.data = { ...data, heightHeader: this.heightHeader, heightFooter: this.heightFooter };

    this.init();

    this.findRootDir();

    this.createTempDirs();

    this.setConfig();
  }

  init() {
    this.timestamp = new Date().getTime();

    this.nameExtension = 'html';

    this.nameFileCss = 'style.css';
    this.nameFileRunnings = 'runnings.js';
    this.nameFileHeader = 'header.html';
    this.nameFileFooter = 'footer.html';

    this.nameIndexOriginal = `index.${this.nameExtension}`;
    this.nameIndexNew = `index-${this.timestamp}.${this.nameExtension}`;
    this.nameRunningsNew = `runnings-${this.timestamp}.js`;

    this.nameFile = `document-${this.timestamp}.pdf`;
    this.nameFileMerged = `documents-merged-${this.timestamp}.pdf`;

    this.pathRepo = path.resolve(this.path);
    this.pathImages = path.join(this.pathRepo, 'pics.json');

    this.pathTemp = path.join(this.pathRepo, 'tmp', 'pdf');
    this.pathTempPdf = path.join(this.pathRepo, 'tmp', 'pdf');
    this.pathTempHtml = path.join(this.pathRepo, 'tmp', 'html');
    this.pathTempJs = path.join(this.pathRepo, 'tmp', 'js');

    this.pathOriginalIndex = path.join(this.pathRepo, this.nameIndexOriginal);
    this.nameOriginalRunnings = path.join(this.pathRepo, this.nameFileRunnings);
    this.pathOriginalCss = path.join(this.pathRepo, this.nameFileCss);
    this.pathOriginalHeader = path.join(this.pathRepo, this.nameFileHeader);
    this.pathOriginalFooter = path.join(this.pathRepo, this.nameFileFooter);

    this.pathNewIndex = path.join(this.pathTempHtml, this.nameIndexNew);
    this.nameNewRunnings = path.join(this.pathTempJs, this.nameRunningsNew);
    this.pathNewFile = path.join(this.pathTempPdf, this.nameFile);
    this.pathNewMerged = path.join(this.pathTempPdf, this.nameFileMerged);

    // Variables
    this.context = '';
    this.contextHeader = '';
    this.contextFooter = '';
    this.contextRunnings = `
      exports.header = {
        height: '[heightHeader]',
        contents: function (__pageNumber, __numberPages) {
          return __context_header;
        },
      };
      
      exports.footer = {
        height: '[heightFooter]',
        contents: function (__pageNumber, __numberPages) {
          return __context_footer;
        },
      };
    `;

    // Objects
    this.images = {};
    this.file = {};

    // Modules
    this.markdownPdf = markdownPdf;
    this.fs = fs;
  }

  findRootDir() {
    if (fsSync.existsSync(this.pathRepo))
      throw new Error(`Not found directory on this path:\n ${this.pathRepo}`);
  }

  findIndex() {
    if (fsSync.existsSync(this.pathOriginalIndex)) return true;

    throw new Error(`Not found "index.html" in directory on this path:\n ${this.pathRepo}`);
  }

  createTempDirs() {
    if (!fsSync.existsSync(this.pathTemp)) fsSync.mkdirSync(pathTemp);
    if (!fsSync.existsSync(this.pathTempPdf)) fsSync.mkdirSync(pathTempPdf);
    if (!fsSync.existsSync(this.pathTempHtml)) fsSync.mkdirSync(pathTempHtml);
    if (!fsSync.existsSync(this.pathTempJs)) fsSync.mkdirSync(pathTempJs);
  }

  findImages() {
    if (fsSync.existsSync(this.pathImages)) return true;

    return false;
  }

  findStyles() {
    if (fsSync.existsSync(this.pathOriginalCss)) return true;

    return false;
  }

  findHeader() {
    if (fsSync.existsSync(this.pathOriginalHeader)) return true;

    return false;
  }

  findFooter() {
    if (fsSync.existsSync(this.pathOriginalFooter)) return true;

    return false;
  }

  setConfig() {
    this.config = {
      remarkable: {
        html: true,
        breaks: true,
        plugins: [remarkClassy],
        syntax: ['footnote', 'sup', 'sub'],
      },
      cssPath: this.findStyles() ? this.pathOriginalCss : undefined,
      runningsPath: this.existsStyles ? this.nameNewRunnings : undefined,
      paperFormat: this.paperFormat,
      paperOrientation: 'portrait',
      paperBorder: '0cm',
    };
  }

  async get() {
    await this.getImages();
    await this.updateImages();

    await this.getHeader();
    await this.getFooter();
    await this.updateRunnigs();
    await this.createRunnigs();
    await this.saveRunnings();

    await this.getIndex();
    await this.updateIndex();
    await this.saveIndex();

    await this.saveFile();

    await this.instanceFile();

    await this.deleteFiles();

    return this.file;
  }

  async combine(files) {
    if (files) {
      if (files.length > 1) {
        const pdfsToMerge = await (async () => {
          if (!Buffer.from(files[0])) {
            const buffers = files.map((pathFile) => {
              const resolvedPathFile = path.resolve(pathFile);
              const bufferFile = fs.readFile(resolvedPathFile);
              return bufferFile;
            });

            return buffers;
          }

          return files;
        })();

        const mergedPdf = await PDFDocument.create();
        for (const pdfBytes of pdfsToMerge) {
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const buffer = await mergedPdf.save();

        await fs.writeFile(this.pathNewMerged, buffer);

        await this.instancePdf(this.pathNewMerged);

        if (!this.notDeleteFiles) await fs.unlink(this.pathNewMerged);

        return this.file;
      }
      throw new Error('The file array must be higher than 1 to combine pdfs.');
    }

    throw new Error('Not found an array of files to combine.');
  }

  async getImages() {
    const existsImages = this.findImages();

    if (existsImages) {
      const jsonString = await fs.readFile(this.pathImages);
      this.images = JSON.parse(jsonString);

      this.data = { ...this.images, ...this.data };
    }
  }

  async updateImages() {
    this.data = { ...this.images, ...this.data };
  }

  async getHeader() {
    const existsHeader = this.findHeader();
    if (existsHeader) this.contextHeader = await fs.readFile(this.nameOriginalHeader, 'utf8');
  }

  async getFooter() {
    const existsFooter = this.findFooter();
    if (existsFooter) this.contextFooter = await fs.readFile(this.nameOriginalFooter, 'utf8');
  }

  async updateRunnigs() {
    let updatedRunnings = this.contextRunnings;

    this.data = {
      ...this.data,
      __context_header: this.contextHeader,
      __context_footer: this.contextHeader,
    };

    const chaves = Object.keys(this.data);
    chaves.forEach((chave) => {
      const etiqueta = `[${chave}]`;
      let value = this.data[chave];
      value = value || '';

      updatedRunnings = updatedRunnings.split(etiqueta).join(value);
    });

    this.contextRunnings = updatedRunnings;
  }

  async saveRunnings() {
    await fs.writeFile(this.nameNewRunnings, this.contextRunnings);
  }

  async getIndex() {
    this.context = await fs.readFile(this.pathOriginalIndex, 'utf8');
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

  async deleteFiles(stopDelete = false) {
    if (this.isToDeleteFiles || stopDelete) {
      const error = (err) => {
        if (err) throw err;
      };

      fs.rmdir(this.pathTemp, error);
      fs.rmdir(this.pathTepathTempPdfmp, error);
      fs.rmdir(this.pathTempHtml, error);
      fs.rmdir(this.pathTempJs, error);

      fs.unlink(this.nameNewRunnings, error);
      fs.unlink(this.pathNewIndex, error);
      fs.unlink(this.pathNewFile, error);
    }
  }
};
