---
title: "Lifecycle Hooks"
tags: documentation
---

Sometimes, you will need to perform some side effects when components are inserted, destroyed or updated.
For these occasions, OutWatch allows you to use special event emitters that emit an empty event during one of these lifecycle events.

## Insert Hook
The insert hook will emit an event containing the inserted DOM element, whenever a virtual-dom element is inserted into the actual DOM.
Use it like this:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}

val sideEffectSink = Sink.create[Element](e => /* your side effect here */)

div(insert --> sideEffectSink)

{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
hookDemo :: forall e. VDom e
hookDemo =
  let sideEffectSink = Sink.create {- your side effect here -}

  in div[insert ==> sideEffectSink]

{% endhighlight %}
</div>

<div class="lang-specific purescript">
Note, that `e`, in this context is the effect type of your side effect.
So if you create a `Sink`, that logs something to the console `e` will have type `(console :: CONSOLE)`.
</div>

## Destroy Hook
The destroy hook will emit an event with the element to be removed, when an element is completely removed from the DOM or if its parent is being removed from the DOM.
Usage is very similar to the insert hook above:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
div(destroy --> sideEffectSink)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
div[destroy ==> sideEffectSink]
{% endhighlight %}
</div>

## Update Hook
The update hook will dispatch an event containing the old DOM element as well as the new one everytime a virtual-dom element is patched, i.e. some child or attribute is changed.
Use it as follows:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}

val updateEffectSink = Sink.create[(Element, Element)]{
  case (old, cur) => /* your side effect here */
}
div(update --> updateEffectSink)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}

let updateEffectSink =
      Sink.create (\(Tuple old cur) -> {- your side effect here -} )

in div[update ==> updateEffectSink]
{% endhighlight %}
</div>

{% include switch-tab-sources.html %}
