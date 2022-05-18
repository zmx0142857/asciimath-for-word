/* globals window, console, document, ActiveXObject, fetch */
export default class XslTransform {
  constructor(xslPath, templatePath) {
    this._xslPath = xslPath;
    this._templatePath = templatePath;
    this._xslDoc = null;
    this._templateDoc = null;
    this.isIE = false;
  }

  async transform(xmlDoc) {
    if (this._xslDoc === null) {
      this._xslDoc = await this._loadXML(this._xslPath);
    }

    if (this.isIE) {
      return xmlDoc.transformNode(this._xslDoc);
    } else if (typeof XSLTProcessor !== undefined) {
      const xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(this._xslDoc);

      const ownerDocument = document.implementation.createDocument("", "", null);
      return xsltProcessor.transformToFragment(xmlDoc, ownerDocument);
    } else {
      console.error("Your browser doesn't support XSLT!");
    }
  }

  /**
   * @param {String} xmlText
   * @returns {Document} xml document
   */
  createXMLDocument(xmlText) {
    let xmlDoc = null;

    if (this.isIE) {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(xmlText);
    } else if (window.DOMParser) {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, "text/xml");
    } else {
      console.error("Your browser doesn't suppoprt XML parsing!");
    }

    return xmlDoc;
  }

  /**
   * loads a remote xml file
   * @param {String} xmlPath
   * @returns {Promise<Document>}
   */
  _loadXML(xmlPath) {
    return fetch(xmlPath)
      .then((res) => res.text())
      .then((xmlText) => this.createXMLDocument(xmlText));
  }

  /**
   * convert mathml to office open xml
   * @param {String} mathml
   * @returns {Promise<String>} xml sting
   */
  async mathml2ooxml(mathml) {
    if (this._templateDoc === null) {
      this._templateDoc = await this._loadXML(this._templatePath);
    }
    const xmlDoc = this.createXMLDocument(mathml);
    const ooxml = await this.transform(xmlDoc);
    const parent = this._templateDoc.documentElement.getElementsByTagName("m:oMathPara")[0];
    const child = this._templateDoc.documentElement.getElementsByTagName("m:oMath")[0];
    parent.replaceChild(ooxml, child);
    return this._templateDoc.documentElement.outerHTML;
  }
}
