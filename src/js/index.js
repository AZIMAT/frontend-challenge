
const ko = require('knockout')
const validation = require('knockout.validation')

ko.validation = validation

//ko.validation.rules.pattern.message = 'Invalid.';

ko.validation.init({
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: true,
    parseInputAttributes: true,
    messageTemplate: null
}, true);


var captcha = function(val) {
    return val == 11;
};

var mustEqual = function(val, other) {
    return val == other;
};

var viewModel = {
    name: ko.observable().extend({required: true, minLength: 2, maxLength: 10}),
    emailAddress: ko.observable().extend({
        // custom message
        required: {
            message: 'Please supply your email address.'
        }
    }),
    age: ko.observable().extend({min: 1, max: 100}),
    subscriptionOptions: ['daily', 'weekly', 'monthly'],
    subscription: ko.observable().extend({required: true}),
    captcha: ko.observable().extend({
        // custom validator
        validation: {
            validator: captcha,
            message: 'Please check.'
        }
    }),
    submit: function() {
        if (viewModel.errors().length === 0) {
            alert('Thank you.');
        }
        else {
            alert('Please check your submission.');
            viewModel.errors.showAllMessages();
        }
    },
    reset: function() {
        Object.keys(viewModel).forEach(function(name) {
            if (ko.isWritableObservable(viewModel[name])) {
                viewModel[name](undefined);
            }
        });
        if (ko.validation.utils.isValidatable(viewModel.location)) {
            viewModel.location.rules.removeAll();
        }
        viewModel.errors.showAllMessages(false);
    }
};

viewModel.errors = ko.validation.group(viewModel);
ko.applyBindings(viewModel);
