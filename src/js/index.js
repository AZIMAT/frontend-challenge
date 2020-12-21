
const ko = require('knockout')
const createUser = require ('sdk/index').createUser;
const validation = require('knockout.validation')

ko.validation = validation

ko.validation.init({
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: true,
    parseInputAttributes: true,
    messageTemplate: null
}, true);


const captchaValidator = function(val) {
    return val == 11;
};


//FirstForm
const name = ko.observable().extend({required: true, minLength: 2, maxLength: 10})
const emailAddress = ko.observable().extend({
  // custom message
  required: {
      message: 'Please supply your email address.'
  }
})

//SecondForm
const age = ko.observable().extend({min: 1, max: 100})
const subscriptionOptions = ['daily', 'weekly', 'monthly']
const subscription = ko.observable().extend({required: true})
const captcha = ko.observable().extend({
    // custom validator
    validation: {
        validator: captchaValidator,
        message: 'Please check.'
    }
})

const viewModel = {
    age,
    name,
    captcha,
    emailAddress,
    subscription,
    subscriptionOptions,
    loading: ko.observable(false),
    successUser: ko.observable(false),
    stepIdentifier: ko.observable(0),
    stepOne: function() {
        viewModel.stepIdentifier(0);
    },
    stepTwo: function() {
        if(this.name.isValid() && this.emailAddress.isValid()){
          viewModel.errors.showAllMessages(false);
          viewModel.stepIdentifier(1);
        }else{
          viewModel.errors.showAllMessages();
        }
    },
    submit: function() {
        if (viewModel.errors().length === 0) {
            const userData = {
              age: this.age(),
              name: this.name(),
              email: this.emailAddress(),
              newsletter: this.subscription(),
            };
            this.loading(true);
            createUser(userData).then(() => {
              alert('Thank you.');
              this.loading(false);
              this.successUser(true);
            })
        }
        else {
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
        viewModel.stepIdentifier(0);
        viewModel.errors.showAllMessages(false);
    }
};

viewModel.errors = ko.validation.group(viewModel);
ko.applyBindings(viewModel);
