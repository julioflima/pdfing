<h1 align="center">Html to PDF</h1>

<p align="center">
  <a href="#">
    <img src="https://user-images.githubusercontent.com/17098382/98701644-4401e080-2358-11eb-9c4d-9254350d1f7c.png" align="center" width="400px"  margin="200px"/>
    </a>
</p>

## What is?
A NodeJS module that converts Html files to PDFs.


## How to install?

```sh
npm install -g markdown-pdf --ignore-scripts
```

## Can you talk more about?
<p align="left">
  The <strong>HtmlToPdf</strong> module to from a HTML parse to a PDF document. From a directory containing, HTML, CSS, JS and images in Base 64, produce an PDF document with <strong>Enterprise</strong> quality. Phantomjs renders the page and saves it to a PDF. You can even customise the style of the PDF by passing an optional path to your CSS _and_ you can pre-process your markdown file before it is converted to a PDF by passing in a pre-processing function, for templating.
</p>

<p align="left">
  <h2 align="left">
    <a href="https://github.com/juloko/MobileECG/blob/master/project.pdf">
      Projeto
    </a>
  </h2>
  <p align="left">
      Confira a proposta na íntegra, clicando nesse <a href="https://github.com/juloko/MobileECG/blob/master/project.pdf">link</a>.
   </p>
</p>

<p align="left">
  <h2 align="left">
    <a href="https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh">
      Visulização do Bancode Dados
    </a>
  </h2>
  <p align="left">
    <ol>
    <li>
      Para uma melhor visualização do banco de dados de cada sensor, você pode utilizar o próprio navegador, para isso tenha instalado em sua máquina o Chrome  baixe a extensão no senguinte <a href="https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh">link</a>.
    </li>
    <li>
      Em seguida copie a URL de GET no tópico API abaixo, modifique "electromyografy" para o nome do sensor desejado.
    </li>
    </ol>
</p>

<p align="left">
   <h2 align="left">Api</h2>
   <h5 align="left">Pega todos os timestamps cadastrados neste sensor, caso queira se remover algum dado.</h5>

`GET http://mobileecgufc.web.app/sensorTimestamps?name=electromyografy`

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> [
>   "1231231434",
>   "1231231435",
>   "1231231436",
>   "1231231437"
> ]
> ```

  <h5 align="left">Pega todos os dados cadastrados neste sensor.</h5>

`GET https://mobileecgufc.web.app/sensor?name=electromyografy`

> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> [
>   {
>     "value": 1,
>     "date": "1970/01/15 06:00:31.434000000",
>     "timestamp": 1231231434
>   },
>   {
>   "value": 2,
>   "timestamp": 1231231435,
>   "date": "1970/01/15 06:00:31.435000000"
>   },
> ]
> ```

  <h5 align="left">Cadastra um novo dado na tabela deste sensor.</h5>

`POST https://mobileecgufc.web.app/sensor?name=electromyografy`

> ```http
> Content-Type: application/json
> {
>   "value":1,
>   "date":"17-09-2020 01:32:01:30",
>   "timestamp":1231231434
> }
> ```

  <h5 align="left">Deleta um dado deste sensor, de acordo com o timestamp.</h5>

`DELETE https://mobileecgufc.web.app/sensor?name=electromyografy`

> ```http
> Content-Type: application/json
> {
>   "timestamp":1231231434
> }
> ```
>
> ```http
> HTTP/1.1 200 OK
> Content-Type: application/json
> Timestamp "1231231434", of sensor "electromyografy"  deleted!
> ```

</p>


## Inspired by who?

Markdown PDF of Alan Shaw. [See also.](https://github.com/alanshaw/markdown-pdf)

## Can I contribute?

Feel free to dive in! [Open an issue](https://github.com/juloko/htmlToPdf/issues/new) or submit PRs.

## License?

[MIT](LICENCE) © Julio Lima


