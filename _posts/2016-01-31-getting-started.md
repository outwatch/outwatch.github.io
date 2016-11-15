---
title:  "Getting Started"
tags: chapters
---


First you will need to install Java, SBT and NPM if you haven't already.
Create a new SBT project and add the ScalaJS plugin to your `plugins.sbt`.
Then add the following line to your `build.sbt`.
{% highlight scala %}
libraryDependencies += "org.outwatch" %%% "outwatch" % "0.2.0"
{% endhighlight %}
Great, we've created our first OutWatch Project!
Now we'll create a small Hello World app to get you started.
First we'll create a new Scala file `HelloOutWatch.scala` in our main directory.
Inside we'll want to import the framework by specifying `import surge.dom._` at the top of our file.
Now we're ready to create our main entry point:
{% highlight scala %}
object HelloOutWatch extends JSApp {
  def main(): Unit = {

  }
}
{% endhighlight %}


Then create an `index.html` file at your project's root.
Inside we'll want to



## The Scan operator

`scan` is the most essential operator for FRP.
If you're from the Scala world, you're probably already familiar with `scan` from the collection API.
Users of Redux or other state containers can also feel similarly at home.
`scan` is a lot like `fold` or `reduce` but creates intermediary values every time.



<h2 id="sbt-new">Using sbt new</h2>

The fastest way to create a new OutWatch application is by using `sbt new`.

{% highlight text %}
sbt new outwatch/seed.g8
{% endhighlight %}

This will create a prompt to create your first project.
