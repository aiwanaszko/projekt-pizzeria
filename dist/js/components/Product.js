import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    ////console.log('thisProduct:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;

    /* START: click event listener to trigger */
    trigger.addEventListener('click', function(event){

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll('.active');

      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {

        /* START: if the active product isn't the element of thisProduct */
        if(!activeProduct === thisProduct.element) {

          /* remove class active for the active product */
          activeProduct.classList.remove('active');

        /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm() {
    const thisProduct = this;

    //console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    //console.log('processOrder');

    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    thisProduct.params = {};

    /* save default price in a variable */
    let price = thisProduct.data.price;
    //console.log('price:', price);

    /* START LOOP: for each paramID in thisProduct.data.params */
    /* save the element in thisProduct.data.params with key paramID as const param */
    for (let paramID in thisProduct.data.params) {

      const param = thisProduct.data.params[paramID];

      /* START LOOP: for each optionID in param.options */
      /* save the element in param.options with key optionID as const option */

      for (let optionID in param.options) {

        const option = param.options[optionID];

        /* save variable to indicate that the option is selected */
        const optionSelected = formData.hasOwnProperty(paramID) && formData[paramID].indexOf(optionID) > -1;

        /* START IF: if option is selected and is not default*/

        if(optionSelected && !option.default) {

          /* increase the default price by the price of that option */
          price += option.price;
        }

        /* ELSE IF: if the option is not selected but is default */
        else if(!optionSelected && option.default) {

          /* decrease the price by the price of that option */
          price -= option.price;

        /* END ELSE IF: if option is not selected and option is default */
        }

        const allPicImages = thisProduct.imageWrapper.querySelectorAll('.' + paramID + '-' + optionID);

        if(!thisProduct.params[paramID]){
          thisProduct.params[paramID] = {
            label: param.label,
            options: {},
          };
        }
        thisProduct.params[paramID].options[optionID] = option.label;

        /* START IF: if option is selected */
        if(optionSelected) {

          /* START LOOP: for each image of the option) */
          for (let picImage of allPicImages) {

            /* all images for this option get a class */
            picImage.classList.add(classNames.menuProduct.imageVisible);

            /* END LOOP: for each image of the option */
          }

          /* ELSE: if option is not selected*/
        } else {

          /* START LOOP: for each image of the option */
          for (let picImage of allPicImages) {

            /* all images for this option lose the class */
            picImage.classList.remove(classNames.menuProduct.imageVisible);

          /* END LOOP: for each image of the option */
          }

        /* END IF: if option is not selected */
        }

        /* END LOOP: for each optionID in param.options */
      }

    /* END LOOP: for each paramID in thisProduct.data.params */
    }

    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log(price);

    console.log('thisProduct.params:', thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}
