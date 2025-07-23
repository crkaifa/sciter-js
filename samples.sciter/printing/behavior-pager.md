# behavior: pager

This behavior provides print preview and PDF generation functionality. 

The behavior can be applied to any block element, `<div>` or `<section>` for example.

## Elements

`<frame type="pager">`  has *behavior:pager* applied by default.

In Sciter, `<frame|pager>` is an ordinary DOM element that can appear in any context where other block elements can appear.

## Model

`<frame|pager>` element maintains references of two documents: page template document and the document being paginated.

To access loaded document from script use `el.pager.document` property that will return child document element:

```js
let frm = document.$("frame#main");
let pagingDoc = frm.pager.document;
let h1header = pagingDoc.$("h1");
...
```

## Attributes

* `src="url"` - optional, URL of document to paginate;
* `content-style="url"` - optional, URL of .css file to be applied to the content. Useful when host document needs to apply some specific styles on top of styles defined in document itself.

## Events

* `"pagination-start"` / `PAGINATION_STARTS` event - generated as a first step of document pagination. At this moment document can be updated using DOM API;
* `"pagination-end"` / `PAGINATION_ENDSS` event - document has finished pagination - `pager.pages` contains valid number of pages.

## Properties

### pager.document

Document, read-only, document object being paginated.

### pager.templateDocument

Document, read-only, page template document object being paginated.

### pager.pageWidth

Length, read-only, "paper" width, e.g. `8.5in`

### pager.pageHeight

Length, read-only, "paper" height, e.g. `11in`

### pager.rows
### pager.columns

integer, read/write, defines grid of pages seen in preview at the same time.

### pager.pages

integer, read-only, number of pages after pagination.

### pager.page

integer, read-only, page number of the first page in preview.

## Methods

### pager.loadFile()

```js
el.pager.loadFile(documentUrl:string[, templateDocumentUrl:string]) : bool
```
initiates loading of the document and the termplate from the URL.

### frame.loadHtml()

```js
el.frame.loadHtml(html:string | ArrayBuffer, baseUrl: string [, templateDocumentUrl:string] ) : bool
```
loads content from the *html* string, _baseUrl_ is used for resolving relative URLs inside the document.

### frame.savePDF()

```js
el.pager.savePDF(options:object) : bool | ArrayBuffer
``` 
Generates PDF into a file or memory buffer.

_Options_ object may contain information used as meta data of generated PDF document:

* _title_ : string - title of the PDF document;
* _creator_ : string - creator of the PDF document;



## Value

N/A

## Page Templates

`<frame|pager>` uses separate document that defines printed page layout - header/footers, content area, page numbers, etc. 

Such a template shall have single `<pageframe/>` element that is a placeholder for the content of printed document.

```
<html page-no="1" page-parity="odd">
<!-- html element for the page template has two attributes:
     page-no=N - number of the page rendered in pageframe.
     page-parity="odd" | "even" - page parity flag. -->
  <head>
    <style>
      body { flow: vertical; }
      body > pageframe  { size:*; margin:0.5in; /* to account dead zones on the page */ }
    </style>
  </head>
<body>
  <pageframe />
</body>
</html>
```

The root `<html>` element will get two special attributes:

* `page-no="1..N"` - will be set to current generting page number;
* `page-parity="odd|even` - will be set to "odd" or "even" so the template can be styled differently for odd and even pages.

The template also may have additional elements with predefined identifiers: 

* `id="page-no"` - this element will get number of the page being generated;
* `id="total-pages"` - this element will get total number of pages;
* `id="document-title"` - title of the document;
* `id="document-url"` - URL of the document being paginated;

Example of the template:

```
<html page-no page-parity>
  <head>
    <style>
      body { padding:0.2in; /* to account dead zones on the page */ }
      pageframe  { size:*; }
      header { border-bottom: 1dip solid #000; }
      footer { border-top: 1dip solid #000; }
      
      html[page-parity=odd] footer  { text-align:left; }
      html[page-parity=even] footer { text-align:right; }
      html[page-parity=odd] pageframe 
      { 
        margin-left:10pt;
        margin-right:20pt;
      }
      html[page-parity=even] pageframe
      {
        margin-left:20pt;
        margin-right:10pt;
      }
      /* html[page-no=1] footer  { text-align:center; } */
    </style>
  </head>
<body>
  <header #document-url></header>
  <pageframe />
  <footer>Page <span #page-no /> of <span #total-pages /></footer>
</body>
</html>

```


