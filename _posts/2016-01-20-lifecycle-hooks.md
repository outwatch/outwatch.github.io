---
title: "Lifecycle Hooks"
tags: documentation
---

Sometimes, you will need to perform some side effects when components are inserted, destroyed or updated.
For these occasions, OutWatch allows you to use special event emitters that emit an empty event during one of these lifecycle events.

## Insert Hook
The insert hook will emit an event, whenever a virtual-dom element is inserted into the actual DOM.
Use it like this:

{% highlight scala %}

val sideEffectSink = Sink.create[Unit](_ => /* your side effect here */ )

div(insert --> sideEffectSink)

{% endhighlight %}

## Update Hook
The update hook will dispatch an event everytime a virtual-dom element is patched, i.e. some child or attribute is changed.
Usage is very similar to the insert hook above:

{% highlight scala %}
div(update --> sideEffectSink)
{% endhighlight %}

## Destroy Hook
The destroy hook will emit an event, when an element is completely removed from the DOM or if its parent is being removed from the DOM.
Use it as follows:

{% highlight scala %}
div(destroy --> sideEffectSink)
{% endhighlight %}
