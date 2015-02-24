;
(function(exports) {

    Parse.TodoRouter = Parse.Router.extend({
        initialize: function() {
            this.collection = new Parse.TodoList();
            this.homeView = new Parse.TodoView({
                collection: this.collection,
                router: this
            });
            this.loginView = new Parse.LoginView({
                router: this
            });
            this.user = Parse.User.current();
            Parse.history.start();
        },

        routes: {
            'item/:id': 'itemDetails',
            'login': 'login',
            '*default': 'home'
        },

        home: function() {
            if (!this.loggedIn()) return;
            this.homeView.$el.removeClass('fade');
            this.collection.models.forEach(function(val) {
                val.view.$el.removeClass('show');
            });
            this.homeView.render();
        },

        itemDetails: function(id) {
            if (!this.loggedIn()) return;
            this.homeView.$el.addClass('fade');
            var item = this.collection.filter(function(val) {
                return id === val.get('title');
            })[0];
            item.view.$el.addClass('show');
            item.view.render();
        },

        login: function() {
            if (this.loggedIn()) {
                this.navigate('', {
                    trigger: true,
                    replace: true
                });
                return;
            }
            this.loginView.render();
        },

        loggedIn: function() {
            if (!Parse.User.current()) {
                this.navigate('login', {
                    trigger: true,
                    replace: true
                });
                return false;
            } else {
                this.collection.query = (new Parse.Query(Parse.TodoItem)).equalTo('user', this.user);
                this.collection.fetch();
                return true;
            }
        }
    });

    Parse.LoginView = Parse.TemplateView.extend({
        view: 'login',
        el: '.listcontainer',
        events: {
            'submit .login': 'login',
            'submit .register': 'register'
        },

        login: function(e) {
            e.preventDefault();
            var user = {
                name: e.target.querySelector('[name=email]').value,
                pass: e.target.querySelector('[name=password]').value
            };
            Parse.User.logIn(user.name, user.pass).then(function() {
                this.options.router.user = Parse.User.current();
                this.options.router.navigate('', {
                    trigger: true,
                    replace: true
                });
            }.bind(this)).fail(function(e) {
                console.log(e.message);
            });
        },

        register: function(e) {
            e.preventDefault();
            var user = {
                username: e.target.querySelector('[name=email]').value,
                email: e.target.querySelector('[name=email]').value,
                password: e.target.querySelector('[name=password1]').value
            };
            var pass2 = e.target.querySelector('[name=password2]').value;
            if (user.password !== pass2) {
                alert('Passwords must match');
                return;
            }
            (new Parse.User(user)).signUp().then(function(u) {
                this.options.router.user = Parse.User.current();
                this.options.router.navigate('', {
                    trigger: true,
                    replace: true
                });
            }.bind(this)).fail(function(e) {
                alert(e.message);
            });
        }
    });

    Parse.ItemView = Parse.TemplateView.extend({
        view: 'item',
        el: '.itemcontainer',
        events: {
            'click .close': 'save'
        },
        save: function(e) {
            if (e.target.parentNode.parentNode.id === this.model.id) {
                _.forEach(e.target.parentNode.parentNode.querySelectorAll('[contenteditable]'), function(val, ind, arr) {
                    this.model.set(val.attributes.name.value, val.innerHTML);
                }.bind(this));
                window.location.hash = '#';
            }
        }
    });

    Parse.TodoItem = Parse.Object.extend({
        className: 'Task',
        defaults: {
            title: '',
            completed: false,
            urgent: false,
            dueDate: null,
            tags: []
        },
        initialize: function() {
            this.view = new Parse.ItemView({
                model: this
            });
            this.on('change', function() {
                this.save();
            });
        }
    });

    Parse.TodoList = Parse.Collection.extend({
        model: Parse.TodoItem,
        comparator: function(m1, m2) {
            var value = 0;
            (m1.get('dueDate') <= m2.get('dueDate')) ? value = -1: value = 1;
            (m1.get('completed') !== m2.get('completed') && m1.get('completed') === true) ? value = 1: null;
            return value;
        }
    });

    Parse.TodoView = Parse.TemplateView.extend({
        el: '.listcontainer',
        view: 'app',
        events: {
            'submit .add': 'addItem',
            'change .list input[type="checkbox"]': 'complete',
            'click .logout': 'logout'
        },

        addItem: function(e) {
            e.preventDefault();
            var item = {
                title: this.el.querySelector('input[type="text"]').value,
                user: Parse.User.current()
            };
            this.collection.create(item);
        },

        complete: function(e) {
            var item = this.collection.filter(function(val) {
                return e.target.id === val.id;
            })[0];
            item.set('completed', !item.get('completed'));
            this.collection.sort();
        },

        logout: function(e) {
            Parse.User.logOut();
            this.collection.reset();
            this.options.router.navigate('login', {
                trigger: true
            });
        }
    });

})(typeof module === 'object' ? module.exports : window);
