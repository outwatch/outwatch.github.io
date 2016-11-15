---
title: "Reactive UI Programming"
tags: chapters
---

OutWatch relies heavily on reactive programming techniques, 
so we're going to do a quick walkthrough on what that actually means.
 
Reactive programming is a paradigm,
that allows us to write highly interactive applications in a declarative matter.

One such canonical example is the use of spreadsheets. 
When we use spreadsheets, we usually define relationships between different cells 
and expect cells to be automatically updated when one cell changes.
We never think about calling something like `update` or `setState` to manually update cells.

The essence here, is that you don't want to be concerned with the ***how*** of your code, but with the ***what***.
Let's look at some pseudo-code to further demonstrate this concept.

First the "old" imperative way:

{% highlight scala %}
cellA = 10
cellB = 20
cellA.onChange = (newValue) => { cellB.update(newValue * 2) }
{% endhighlight %}

We register a "Callback" to our `cellA` that will update the state of `cellB`.
While this doesn't really look bad right now, we can imagine, that as we grow our application,
things can get quite unwieldy fast and we have to keep track of what code changes what state.

**With this approach we really can't know how our cells behave, because their behaviour is implicit in the rest of our code. 
100 lines later some other cell could come along and change the state of `cellA` or `cellB`
It's very easy to lose track this way.**

Now for our "new" reactive approach:

{% highlight scala %}
cellA = new Behavior(10)
cellB = cellA.map( value => value * 2 )
{% endhighlight %}

With this approach, we eliminate the need for a callback and instead define `cellB` as directly dependent on `cellA`.
There's no way to access the state of `cellB` from the outside.

**Whenever you want to understand how an element behaves, you only have to look at its definition. 
Everything that can happen to it will appear on the right-hand side.
The whole behavior should be available at the time of declaration.**


The reasons to adopt Reactive programming are very similar to those of functional programming, 
namely to build self-responsible components which define only their own functionality rather than changing external state. 
This leads to decoupled modules that are very reusable. 
We no longer have to check our entire code to find where our state is modified.


Now you might wonder, what exactly the call to `new Behavior` does and that's where implementation largely differ.
Some implementations opt for so called "Reactive Variables" or "Observers", while others make use of "Event Streams"
As a framework OutWatch is built upon streams, namely Rx, as its primary building block.

Next up, we will look at these streams and figure out how they can help us build applications.



