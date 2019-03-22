/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
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
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget)
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
      });
    }

    processOrder() {
      const thisProduct = this;

      //console.log('processOrder');

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

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
      price *= thisProduct.amountWidget.value;
      
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = price;
      //console.log(price);
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(event) {
	    thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      thisWidget.value = newValue;
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
	     const thisWidget = this;

	       thisWidget.input.addEventListener('change', function(event) {
	       thisWidget.setValue(thisWidget.input.value);
       });

	        thisWidget.linkDecrease.addEventListener('click', function(event) {
	        event.preventDefault();
	        thisWidget.setValue(thisWidget.value - 1);
        });

	       thisWidget.linkIncrease.addEventListener('click', function(event) {
	       event.preventDefault();
         thisWidget.setValue(thisWidget.value + 1);
       });
    }

    announce() {
	     const thisWidget = this;

	      const event = new Event('updated');
	       thisWidget.element.dispatchEvent(event);
       }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;

      ////console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };



  app.init();
}
