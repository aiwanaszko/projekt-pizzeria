/* eslint-disable no-unused-vars */
/* global flatpickr */

import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {settings, select} from '../settings.js';

export class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);


    flatpickr(thisWidget.dom.input, {
      dateFormat: 'Y-m-d',
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      onChange: function(selectedDates, dateStr, instance) {
        thisWidget.value = dateStr;
      },
      'disable': [
        function(date) {
          // return true to disable
          return date.getDay() === 1;

        }
      ],
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      }
    });
  }

  parseValue(newValue){
    const thisWidget = this;

    return newValue;
  }

  isValid(newValue){
    const thisWidget = this;

    return true;
  }

  renderValue() {
    const thisWidget = this;
  }

}
