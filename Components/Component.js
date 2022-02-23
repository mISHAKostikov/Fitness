// 25.12.2020


export class Component extends HTMLElement {
  static _dom_promise = null;
  
  
  _attributes = {};
  _body = null;
  _elements = {};
  _root = null;
  
  
  built = this._build();
  
  
  
  
  static async _dom_promise_create(urls = null) {
    if (!urls) return;
    
    let template = document.createElement('template');
    
    if (urls.html) {
      template.innerHTML = await (await fetch(urls.html)).text();
    }
    
    if (urls.css) {
      let link = document.createElement('link');
      link.href = urls.css;
      link.rel = 'stylesheet';
      link.setAttribute('sync', true);
      
      template.content.prepend(link);
    }
    
    return template.content;
  }
  
  
  
  
  static init(urls = null) {
    if (urls) {
      this._dom_promise = this._dom_promise_create(urls);
    }
    
    let tag = 'c-' + this.name.replace(/_/g, '-').toLowerCase();
    // let tag = this.name.replace(/_/g, '-').toLowerCase() + '-';
    customElements.define(tag, this);
  }
  
  
  
  
  _attributes_define(attributes) {
    for (let k in attributes) {
      let attribute = this._root.getAttribute(k);
      let attribute_type = attributes[k];
      
      if (typeof attribute_type == 'number') {
        this._attributes[k] = +attribute;
      }
      else {
        this._attributes[k] = attribute;
      }
    }
  }
  
  
  async _build() {
    if (!this.constructor._dom_promise || this._root) return;
    
    this._root = this.attachShadow({mode: 'closed'});
    
    let dom = (await this.constructor._dom_promise).cloneNode(true);
    this._root.append(dom);
    
    // this._body = this._root.querySelector(`#${this.constructor.name.toLowerCase()}`);
    // this._body = this._root.querySelector(`[id='${this.constructor.name}' i]`);
    this._body = this._root.querySelector(`x_${this.constructor.name}`);
    
    let elements = this._root.querySelectorAll('[sync]');
    
    if (!elements.length) return;
    
    let promises = [...elements].map(
      (element) => new Promise(
        (fulfill, reject) => {
          element.onerror = reject;
          element.onload = fulfill;
        }
      )
    );
    
    await Promise.allSettled(promises);
  }
  
  
  _elements_define(selectors) {
    for (let k in selectors) {
      let selector = selectors[k];
      
      if (!selector) {
        this._elements[k] = this._root.querySelector(`#${k}`);
      }
      else if (typeof selector == 'string') {
        this._elements[k] = this._root.querySelector(selector);
      }
      else if (selector instanceof Array) {
        this._elements[k] = this._root.querySelectorAll(selector);
      }
    }
  }
  
  
  
  
  dispatchEvent_async(event) {
    setTimeout(() => this.dispatchEvent(event));
  }
}


Component.init();
