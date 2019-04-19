export class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
}
