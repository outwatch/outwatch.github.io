---
title: "Managing state"
tags: chapters
---

Managing state can be a very tricky thing in larger applications.
Demonstrating a good and simple method for managing state using small applications as examples is even harder.
We already gave some good arguments for how reactive programming can vastly improve state management in our [Reactive UI Programming chapter](/reactive-ui-programming), now how about we look at how this actually works.

Let's jump right into our first example, a very simple counter application.
It has a "+" button and a "-" button, that each add or subtract one from a counter.
It's not the coolest application you can find, but it shows how we can keep state between interactions.

So in essence, we want to create two streams, merge them and keep state between them.
Let's start by creating the app with the two streams.
{% highlight scala %}

val additions = createHandler[Int]
val subtractions = createHandler[Int]

val node = div(
  div(
    button(click(1) --> plusClicks, "+"),
    button(click(-1) --> handleMinus, "-"),
    span("Count: ")
  )
)

OutWatch.render("#app", node)
{% endhighlight %}

So far, so good, we now have to streams representing our additions and our subtractions.
Notice how we use a custom handler of type `Int`.
We can do this for any type we like by simply calling the `createHandler[]` function with any type.

Next up, we're going to want to merge our streams together. We can use the `merge` function for that.
What it does, is just take all the emissions from both streams and emit them all into a new third stream.

Here's a diagram to demonstrate how this works:

![Merge Diagram]({{ site.url }}/img/MergeMarbles.png)

So let's add a third stream as a result of our first two streams.

{% highlight diff %}
//..

+ val operations = subtractions.merge(additions)

//...
{% endhighlight %}

Great, now we're almost there!
Now we only need to keep state somehow. If you remember the `scan` operator from our [Streams chapter](/streams#scan), you're on the right path.

Here's a quick reminder on what it does:
> `scan` is a lot like `fold` or `reduce` but creates intermediary values every time.
>Folds in functional programming iterate a sequential data structure like a list and
> "reduces" or "folds" it into a single element.
> `scan` however accumulates state every time the stream emits, so we don't get a single element, but a stream of accumulated elements.

The `scan` function takes two arguments. A `seed` and a `reducer function`.
The reducer function is a function with the following signature.
{% highlight scala %}
(previousState, nextElement) => newState
{% endhighlight %}

The `previousState` is also often called the `accumulator` and the `nextElement` is also often called the `current`.
These can then be shortened to `acc` and `cur`, which you've probably seen somewhere before.

The seed is the initial value, that is used for the accumulator, when the first element is emitted.
In our case, we'd like to start with `0`, so we specify `0` as our seed.

Let's change our code to reflect the things we just talked about.

{% highlight diff %}
//..

- val operations = subtractions.merge(additions)
+ val state = subtractions.merge(additions)
+   .scan(0)((acc, cur) => acc + cur)

val node = div(
  div(
    button(click(1) --> plusClicks, "+"),
    button(click(-1) --> handleMinus, "-"),
-   span("Count: ")
+   span("Count: ", child <-- state)
  )
)

//...
{% endhighlight %}

And now we got our first stateful application. Awesome!

If you're still having some trouble wrapping your head around what we just did, here's the continuation of the diagram we saw before:

![Scan Diagram]({{ site.url }}/img/AddScanMarbles.png)


Okay great, that was pretty simple, so we're going to try and further demonstrate our ability to effectively handle state management with a small but significant example.

Of course the canonical example is the infamous "Todo list application". So let's build one, shall we?

We're gonna use the exact same methodology we used before.
We're going to need two streams, one for adding Todo items and one for deleting them.
Also, we're gonna use components to modularize our code properly.

First let's define our



//Redux style counter application w/ reducers
-- Single source of truth
//OutWatch style counter application
