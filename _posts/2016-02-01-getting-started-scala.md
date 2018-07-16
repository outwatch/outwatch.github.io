---
title:  "Get started with Scala"
tags: intro
---


First things first, in order to use OutWatch you will need to have Java and sbt installed.
Check out [this guide](https://java.com/en/download/help/download_options.xml) for Java and [this guide](http://www.scala-sbt.org/release/docs/Setup.html) for sbt if you're unsure how to proceed.

<h2 id="sbt-new">Using sbt new</h2>

The fastest and easiest way to create a new OutWatch application is by using `sbt new`.
Note that this requires sbt version `0.13.13`, so update to that version if you don't have it yet.

{% highlight text %}
$ sbt new outwatch/seed.g8
{% endhighlight %}

This will create a prompt to create your first project. It will be in a new directory of your given name.
To compile your Scala code to JavaScript simply run:

{% highlight text %}
$ cd <your-project-name>
$ sbt dev
{% endhighlight %}

Then open `http://localhost:8080` in your browser to see what you just created.

Internally the template is using scalajs-bundler and webpack-dev-server to serve the page. When you change a source file, it automatically recompiles and reloads the page in the browser.

### Opening your project in IntelliJ

To open your project in IntelliJ IDEA (Community or Ultimate Edition doesn't matter), simply go to `File -> Open` and then choose the directory you just created.
IntelliJ should now start indexing the files and be ready shortly.


## Creating an OutWatch project from scratch

Create a new SBT project and add the ScalaJS and ScalaJS-bundler plugins to your `plugins.sbt`:
{% highlight scala %}
addSbtPlugin("org.scala-js" % "sbt-scalajs" % "0.6.24")
addSbtPlugin("ch.epfl.scala" % "sbt-scalajs-bundler" % "0.13.1")
{% endhighlight %}

Then add the following line to your `build.sbt`.
{% highlight scala %}
libraryDependencies += "io.github.outwatch" %%% "outwatch" % "1.0.0-RC2"
{% endhighlight %}
Great, we've created our first OutWatch Project!

Now we'll create a small Hello World app to get you started.
First we'll create a new Scala file `HelloOutWatch.scala` in our main directory.
Now we're ready to create our main entry point:
{% highlight scala %}
import outwatch.dom._
import outwatch.dom.dsl._
import monix.execution.Scheduler.Implicits.global

object HelloOutWatch {
  def main(args: Array[String]): Unit = {

  }
}
{% endhighlight %}

Inside our `main` function we will want to write the following line:

{% highlight scala %}
OutWatch.renderInto("#app", h1("Hello World")).unsafeRunSync()
{% endhighlight %}

This will render an `h1` element into the element with the id `app`.

Next we'll need to create an `index.html` file at your project's root.
Inside we'll want to add a reference to our js files and also add a node in which we want to display our app:

{% highlight html %}
<body>
  <div id="app"></div>
  <script type="text/javascript" src="./target/scala-2.12/scalajs-bundler/main/<your-project-name>-fastopt-bundle.js"></script>
</body>
{% endhighlight %}

We're basically done here. We created our first app. Now we only need to run it.

To run this, simply launch `sbt` and then use the `fastOptJS::webpack` command to compile your code to JavaScript.
{% highlight text %}
$ sbt
> fastOptJS::webpack
{% endhighlight %}

And with that, we're done, check your browser, to see what we just created (it's not that special, but it's something).
