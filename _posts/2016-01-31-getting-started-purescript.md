---
title:  "Get started with <br> PureScript"
tags: intro
---

First you will need to install PureScript and pulp if you haven't already.
Check out [this guide](http://www.purescript.org/learn/getting-started/) if you're unsure how to proceed.

## Creating a new OutWatch project from scratch

Create a new PureScript project with Pulp by running `pulp init`.
Then run the following commands to install OutWatch.

{% highlight text %}
$ bower install purescript-outwatch
$ npm install rxjs snabbdom
{% endhighlight %}

Great, we've created our first OutWatch Project!

Now we'll create a small Hello World app to get you started.
Inside our `Main.purs` file, we'll want to import the framework by specifying `import OutWatch` at the top of our file.
Now we're ready to create our main entry point:
{% highlight haskell %}
module Main where

import OutWatch

main = ...

{% endhighlight %}

Inside our `main` function we will want to write the following line:

{% highlight haskell %}
render "#app" (h1 [text "Hello World"])
{% endhighlight %}

This will render an `h1` element into the element with the id `app`.
If you want to, you can also use qualified imports of the different parts of the library.

{% highlight haskell %}
module Main where

import OutWatch.Tags (h1) as H
import OutWatch.Attributes (text)
import OutWatch.Core (render) as OutWatch

main =
  OutWatch.render "#app" (H.h1 [text "Hello World"])

{% endhighlight %}

Next we'll need to create an `index.html` file at your project's root.
Inside we'll want to add a reference to our js file and also add a node in which we want to display our app:

{% highlight html %}
<body>
  <div id="app"></div>
  <script type="text/javascript" src="index.js"></script>
</body>
{% endhighlight %}

We're basically done here. We created our first app. Now we only need to run it.

To run this, simply use the `pulp browserify` command to compile your code to JavaScript.
{% highlight text %}
$ pulp browserify --to index.js
{% endhighlight %}

And with that, we're done, check your browser, to see what we just created (it's not that special, but it's something).

### Recompiling your files as needed

Retyping `pulp browserify` every time we want to compile can get quite annoying and inefficient.
Luckily, with `pulp`, we can run every command in watch mode by simply adding the `--watch` flag in front of it.
{% highlight text %}
$ pulp --watch browserify --to index.js
Build successful.
Browserifying...
Browserified.
Source tree changed; restarting:
{% endhighlight %}

And voila, you've created your first working developer environment.
