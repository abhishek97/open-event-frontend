import Ember from 'ember';
import moment from 'moment';
import { licenses, timezones } from 'open-event-frontend/utils/dictionary';
import FormMixin from 'open-event-frontend/mixins/form';
import { orderBy, filter } from 'lodash';
import { FORM_DATE_FORMAT } from 'open-event-frontend/utils/dictionary';

const { Component, computed } = Ember;

export default Component.extend(FormMixin, {

  currentTimezone: moment.tz.guess(),

  getValidationRules() {
    return {
      inline : true,
      delay  : false,
      on     : 'blur',
      fields : {
        name: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Please give your event a name'
            }
          ]
        },
        start_date: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Please tell us when your event starts'
            },
            {
              type   : 'date',
              prompt : 'Please give a valid start date'
            }
          ]
        },
        end_date: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Please tell us when your event ends'
            },
            {
              type   : 'date',
              prompt : 'Please give a valid end date'
            }
          ]
        },
        start_time: {
          depends : 'start_date',
          rules   : [
            {
              type   : 'empty',
              prompt : 'Please give a start time'
            }
          ]
        },
        end_time: {
          depends : 'end_date',
          rules   : [
            {
              type   : 'empty',
              prompt : 'Please give an end time'
            }
          ]
        },
        ticket_name: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Please give your ticket a name'
            }
          ]
        },
        ticket_description: {
          optional : true,
          rules    : [
            {
              type   : 'maxLength[160]',
              prompt : 'Ticket description shouldn\'t contain more than {ruleValue} characters'
            }
          ]
        },
        ticket_price: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Please give your ticket a price'
            },
            {
              type   : 'number',
              prompt : 'Please give a proper price for you ticket'
            }
          ]
        },
        ticket_quantity: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Please specify how many tickets of this type are available'
            },
            {
              type   : 'number',
              prompt : 'Please give a proper quantity for you ticket'
            }
          ]
        },
        ticket_min_order: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Minimum tickets per order required'
            },
            {
              type   : 'number',
              prompt : 'Invalid number'
            }
          ]
        },
        ticket_max_order: {
          rules: [
            {
              type   : 'empty',
              prompt : 'Maximum tickets per order required'
            },
            {
              type   : 'number',
              prompt : 'Invalid number'
            }
          ]
        }
      }
    };
  },

  timezones: computed(function() {
    return timezones;
  }),

  licenses: computed(function() {
    return orderBy(licenses, 'name');
  }),

  hasPaidTickets: computed('data.event.tickets.[]', function() {
    return filter(this.get('data.event.tickets'), ticket => ticket.get('type') === 'paid').length > 0;
  }),

  actions: {
    saveDraft() {
      this.$('form').form('validate form');
    },
    moveForward() {
      this.$('form').form('validate form');
    },
    addTicket(type) {
      const salesStartDateTime = moment(this.get('data.event.startDate'), FORM_DATE_FORMAT).subtract(1, 'months');
      const salesEndDateTime = salesStartDateTime.clone().add(10, 'days');
      this.get('data.event.tickets').pushObject(this.store.createRecord('ticket', {
        type,
        salesStartDateTime : salesStartDateTime.toDate(),
        salesEndDateTime   : salesEndDateTime.toDate()
      }));
    },
    removeTicket(ticket) {
      ticket.unloadRecord();
      this.get('data.event.tickets').removeObject(ticket);
    },
    addItem(type, model) {
      this.get(`data.event.${type}`).pushObject(this.store.createRecord(model));
    },
    removeItem(item, type) {
      item.unloadRecord();
      this.get(`data.event.${type}`).removeObject(item);
    },
    openTaxModal() {
      this.set('taxModelIsOpen', true);
    },
    deleteTaxInformation() {
      this.set('data.event.hasTaxInfo', false);
      this.get('data.event.taxInfo').unloadRecord();
      this.set('data.event.taxInfo', this.store.createRecord('tax-info'));
    }
  }
});