---
title: "Lifecycle Hooks"
tags: documentation
---

Sometimes, you will need to perform some side effects when components are inserted, destroyed or updated.
For these occasions, OutWatch allows you to use special event emitters that emit an empty event during one of these lifecycle events.

## Insert Hook
The insert hook will emit an event containing the inserted DOM element, whenever a virtual-dom element is inserted into the actual DOM.
Use it like this:

{% highlight scala %}

val sideEffectSink = Sink.create[Element](e => /* your side effect here */)

div(insert --> sideEffectSink)

{% endhighlight %}


## Destroy Hook
The destroy hook will emit an event with the element to be removed, when an element is completely removed from the DOM or if its parent is being removed from the DOM.
Usage is very similar to the insert hook above:

{% highlight scala %}
div(destroy --> sideEffectSink)
{% endhighlight %}

## Update Hook
The update hook will dispatch an event containing the old DOM element as well as the new one everytime a virtual-dom element is patched, i.e. some child or attribute is changed.
Use it as follows:

{% highlight scala %}

val updateEffectSink = Sink.create[(Element, Element)]{
  case (old, cur) => /* your side effect here */
}
div(update --> updateEffectSink)
{% endhighlight %}
