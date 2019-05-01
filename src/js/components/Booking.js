/* eslint-disable no-unused-vars */

import {settings, select, templates, classNames} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import {utils} from '../utils.js';

export class Booking{
  constructor() {
    const thisBooking = this;

    thisBooking.render(document.querySelector(select.containerOf.booking));
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render() {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    /* save the argument as wrapper */
    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);

    /* insert generated HTML code into wrapper */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.form.addEventListener('submit', function() {
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

  }

  updateDOM() {
    const thisBooking = this;
    console.log('Hello');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);


    for (let singleTable of thisBooking.dom.tables) {
      let tableNumber = parseInt(singleTable.getAttribute(settings.booking.tableIdAttribute));

      if (thisBooking.booked[thisBooking.date] !== 'undefined' && thisBooking.booked[thisBooking.date][thisBooking.hour] !== 'undefined' && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableNumber)) {
        singleTable.classList.add(classNames.booking.tableBooked);
      } else singleTable.classList.remove(classNames.booking.tableBooked);
    }

    for (let singleTable of thisBooking.dom.tables) {
      singleTable.addEventListener('click', function() {
        if (!(singleTable.classList.contains(classNames.booking.tableBooked))) {
          singleTable.classList.add(classNames.booking.tableReserved);
        }
      });
      thisBooking.dom.hourPicker.addEventListener('updated', function() {
        console.log('change of time');
        if (singleTable.classList.contains(classNames.booking.tableReserved)) {
          singleTable.classList.remove(classNames.booking.tableReserved);
        }
      });
    }

    thisBooking.dom.datePicker.addEventListener('updated', function() {
      console.log('change of hour');
      for (let singleTable of thisBooking.dom.tables) {
        if (singleTable.classList.contains(classNames.booking.tableReserved)) {
          singleTable.classList.remove(classNames.booking.tableReserved);
        }
      }
    });
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    for (let singleTable of thisBooking.dom.tables) {
      if (singleTable.classList.contains(classNames.booking.tableReserved)) {
        const tableNumber = parseInt(singleTable.getAttribute(settings.booking.tableIdAttribute));
        thisBooking.table = tableNumber;
      }
    }

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.table,
      people: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }) .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

      console.log('thisBooking.booked', thisBooking.booked);

  }


  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    // console.log('eventsCurrent', eventsCurrent)
    // console.log('BOOKINGS', bookings);
    // console.log('eventsRepeat', eventsRepeat);

    for (let i = 0; i < eventsCurrent.length; i++) {
      const { date, duration, table, hour } = eventsCurrent[i];
      thisBooking.makeBooked(date, duration, table, hour);
    }

    for (let i = 0; i < bookings.length; i++) {
      const { date, duration, table, hour } = bookings[i];
      thisBooking.makeBooked(date, duration, table, hour);
    }

    thisBooking.minDate = new Date();
    thisBooking.maxDate = utils.addDays(thisBooking.minDate, settings.datePicker.maxDaysInFuture);

    // console.log('minDate', thisBooking.minDate);
    // console.log('maxDate', thisBooking.maxDate);

    for (let i = thisBooking.minDate; i < thisBooking.maxDate; i = utils.addDays(i, 1)) {
      for (let j = 0; j < eventsRepeat.length; j++) {
        const { date, duration, table, hour } = eventsRepeat[j];
        thisBooking.makeBooked(utils.dateToStr(i), duration, table, hour);
      }
    }
    console.log('booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, duration, table, hour){
    const thisBooking = this;
    thisBooking.booked[date] = thisBooking.booked[date] || {};

    for (let i = 0; i < duration; i = i + 0.5) {
      if(typeof thisBooking.booked[date][utils.hourToNumber(hour) + i] === 'undefined') {
        thisBooking.booked[date][utils.hourToNumber(hour) + i] = [table];
      } else {
        thisBooking.booked[date][utils.hourToNumber(hour) + i].push(table);
      }
    }

  }

}
