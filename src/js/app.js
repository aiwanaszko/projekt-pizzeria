/* eslint-disable no-unused-vars */

import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames, templates} from './settings.js';
import {Booking} from './components/Booking.js';

const app = {
  initMenu: function() {
    const thisApp = this;

    ////console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initPages: function() {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    let pagesMatchingHash = [];

    if(window.location.hash.length > 2){
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page) {
        return page.id == idFromHash;
      });

      thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    }

    for (let link of thisApp.navLinks){
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        /*TODO: get page id from href */
        const href = clickedElement.getAttribute('href');

        const pageId = href.replace('#', '');

        /*TODO: activate page*/
        thisApp.activatePage(pageId);


      });
    }

    // poczatek kodu do poprawienia

    /* thisApp.orderLink = document.querySelector(select.containerOf.orderLink);
    thisApp.bookingLink = document.querySelector(select.containerOf.bookingLink);



    thisApp.orderLink.addEventListener('click', function(){

      for (let page of thisApp.pages) {
        const clickedElement = this;
        event.preventDefault();


        const href = clickedElement.getAttribute('href');

        const pageId = href.replace('#', '');

        if (page.getAttribute('id') == 'order') {
          thisApp.activatePage(pageId);
        }
      }
    });

    thisApp.bookingLink.addEventListener('click', function(){

      console.log('booking link', thisApp.bookingLink);

      for (let page of thisApp.pages) {
        const clickedElement = this;
        event.preventDefault();

        const href = clickedElement.getAttribute('href');
        console.log('HREF', href);

        const pageId = href.replace('#', '');
        console.log('pageId', pageId);

        if (page.getAttribute('id') == 'booking') {
          thisApp.activatePage(pageId);
        }
      }
    }); */


    // koniec kodu do poprawienia
  },

  activatePage: function(pageId) {
    const thisApp = this;

    for (let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
    }

    window.location.hash = '#/' + pageId;
  },


  initData: function() {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function(){
    const thisApp = this;

    const reservationWidget = document.querySelector(select.containerOf.booking);

    const newBooking = new Booking();
  }
};

app.init();
