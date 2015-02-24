window.onload = app;

// runs when the DOM is loaded
function app(){
    "use strict";

    // load some scripts (uses promises :D)
    loader.load(
        //css
        {url: "./dist/style.css"},
        //js
        {url: "./bower_components/jquery/dist/jquery.min.js"},
        {url: "./bower_components/lodash/lodash.min.js"},

        // when using just Backbone, use this line
        // {url: "./bower_components/backbone/backbone.js"},
        // when using Parse, comment out the above line and uncomment the line below
        {url: "./bower_components/parse-js-sdk/lib/parse.min.js"},

        // when using React (and the plugin JSnoX), uncomment the following two lines
        // {url: "./bower_components/react/react.min.js"},
        // {url: "./bower_components/jsnox/index.js"},

        // other stuff
        {url: "./bower_components/pace/pace.min.js"},
        {url: "./js/TemplateView.js"},
        {url: "./js/todo.js"}
    ).then(function(){
        document.querySelector("html").style.opacity = 1;
        // start app?

        Parse.initialize("rUv6TbkVQAITaCWYJiURT0sWvUAWiUdOPfrx3fNG", "CpkyrEVgyfSpug8CWnlmtTGFx39X9dpgGjvyce5E");

        window.router = new Parse.TodoRouter();

    });

}